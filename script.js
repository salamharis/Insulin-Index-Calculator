let insulinData = [];
let timeData = [];
let firstInsulin = null;

function addData() {
    const insulinLevel = parseFloat(document.getElementById('insulinInput').value);
    const time = parseFloat(document.getElementById('timeInput').value);
    
    if (!isNaN(insulinLevel) && !isNaN(time)) {
        if (firstInsulin === null && insulinData.length === 0) {
            firstInsulin = insulinLevel;
        }
        insulinData.push(insulinLevel);
        timeData.push(time);
        document.getElementById('insulinInput').value = '';
        document.getElementById('timeInput').value = '';
        updateDataTable();
        plotGraph();
    } else {
        alert("Please enter valid numbers for time and insulin concentration.");
    }
}

function updateDataTable() {
    const table = document.getElementById('dataTable');
    table.style.display = 'table';
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = '';
    insulinData.forEach((insulin, i) => {
        const row = `<tr>
                        <td>${timeData[i]}</td>
                        <td>${insulin}</td>
                        <td><button onclick="removeData(${i})">Remove</button></td>
                    </tr>`;
        tableBody.innerHTML += row;
    });
}

function plotGraph() {
    const ctx = document.getElementById('insulinChart').getContext('2d');
    
    if (window.myChart) {
        window.myChart.destroy();
    }
    
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeData,
            datasets: [{
                label: 'Insulin Data',
                data: insulinData,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: function(context) {
                    const chart = context.chart;
                    const {ctx, chartArea, scales} = chart;

                    if (!chartArea) {
                        return null;
                    }

                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    const yPosThreshold = scales.y.getPixelForValue(insulinData[0]);  // Use first insulin value as threshold

                    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // Transparent below the threshold
                    gradient.addColorStop((chartArea.bottom - yPosThreshold) / chartArea.height, 'rgba(0, 0, 0, 0)');
                    gradient.addColorStop((chartArea.bottom - yPosThreshold) / chartArea.height, 'rgba(54, 162, 235, 0.2)');
                    gradient.addColorStop(1, 'rgba(54, 162, 235, 0.2)');

                    return gradient;
                },
                borderWidth: 1,
                fill: 'start'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (min)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Insulin Level (pmol/L)'
                    },
                    beginAtZero: false
                }
            },
            elements: {
                line: {
                    tension: 0
                }
            }
        }
    });
}

function removeData(index) {
    insulinData.splice(index, 1);
    timeData.splice(index, 1);
    updateDataTable();
    plotGraph();
}

function clearData() {
    insulinData = [];
    timeData = [];
    firstInsulin = null;
    document.getElementById('dataTable').style.display = 'none';
    document.getElementById('savePdfBtn').style.display = 'none';
    document.getElementById('result').innerHTML = '';
    updateDataTable();
    if (window.myChart) window.myChart.destroy();
}

function calculateAUC() {
    if (insulinData.length < 2 || timeData.length < 2) {
        alert("Not enough data points to calculate AUC.");
        return;
    }

    // Normalize insulin data
    const newInsul = insulinData.map(value => value - insulinData[0]);

    // Create a more granular time array
    const tMin = Math.min(...timeData);
    const tMax = Math.max(...timeData);
    const t = [];
    for (let i = 0; i <= 1000; i++) {
        t.push(tMin + (i / 1000) * (tMax - tMin));
    }

    // Interpolate insulin values
    const nInsul = t.map(time => {
        let leftIndex = 0;
        while (leftIndex < timeData.length - 1 && timeData[leftIndex + 1] <= time) {
            leftIndex++;
        }
        if (leftIndex === timeData.length - 1) {
            return newInsul[leftIndex];
        }
        const rightIndex = leftIndex + 1;
        const fraction = (time - timeData[leftIndex]) / (timeData[rightIndex] - timeData[leftIndex]);
        return newInsul[leftIndex] + fraction * (newInsul[rightIndex] - newInsul[leftIndex]);
    });

    // Filter positive values
    const posIndices = nInsul.map((value, index) => value > 0 ? index : -1).filter(index => index !== -1);
    const posInsul = posIndices.map(index => nInsul[index]);
    const posT = posIndices.map(index => t[index]);

    // Calculate AUC using trapezoidal rule
    let auc = 0;
    for (let i = 0; i < posInsul.length - 1; i++) {
        auc += (posInsul[i] + posInsul[i + 1]) * (posT[i + 1] - posT[i]) / 2;
    }

    const resultElement = document.getElementById('result');
    resultElement.innerHTML = `The AUC (Area Under the Curve) for shaded area is: ${Math.round(auc)}`;

    // Show the "Save to PDF" button after AUC calculation
    document.getElementById('savePdfBtn').style.display = 'inline-block';
}

async function saveToPdf() {
    if (insulinData.length === 0 || timeData.length === 0) {
        alert("No data to save. Please add some data first.");
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text("Insulin Index Calculator Results", 105, 15, null, null, "center");

        // Set up table
        const columns = ["Time (min)", "Insulin concentration (pmol/L)"];
        const data = timeData.map((time, index) => [time.toString(), insulinData[index].toString()]);
        
        // Add table
        doc.autoTable({
            head: [columns],
            body: data,
            startY: 25,
            styles: { fontSize: 12, cellPadding: 2 },
            headStyles: { fillColor: [200, 200, 200], textColor: 20 }, // Gray background for header
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 80 }
            },
        });

        // Get the Y position after the table
        const finalY = doc.lastAutoTable.finalY || 25;

        // Capture and add chart image
        const canvas = await html2canvas(document.getElementById('insulinChart'));
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 10, finalY + 10, 190, 100);

        // Add AUC value
        const aucValue = document.getElementById('result').innerText;
        doc.setFontSize(14);
        doc.text(aucValue, 14, finalY + 120);

        // Save the PDF
        doc.save('insulin_data.pdf');
    } catch (error) {
        console.error('Error saving to PDF:', error);
        alert('An error occurred while saving to PDF. Please try again.');
    }
}
