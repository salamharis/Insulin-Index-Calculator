let concentrationData = [];
let timeData = [];
let firstConcentration = null;
let currentParameter = 'glucose';
let currentUnit = 'mmol/L';

function getSelectedParameter() {
    return document.querySelector('input[name="parameter"]:checked').value;
}

function getSelectedUnit() {
    return document.querySelector('input[name="unit"]:checked').value;
}

function updateLabels() {
    currentParameter = getSelectedParameter();
    currentUnit = getSelectedUnit();
    document.querySelector('label[for="concentrationInput"]').textContent = `${currentParameter.charAt(0).toUpperCase() + currentParameter.slice(1)} concentration (${currentUnit}):`;
}

document.querySelectorAll('input[name="parameter"], input[name="unit"]').forEach(radio => {
    radio.addEventListener('change', updateLabels);
});

function addData() {
    const concentration = parseFloat(document.getElementById('concentrationInput').value);
    const time = parseFloat(document.getElementById('timeInput').value);
    
    if (!isNaN(concentration) && !isNaN(time)) {
        if (firstConcentration === null && concentrationData.length === 0) {
            firstConcentration = concentration;
        }
        concentrationData.push(concentration);
        timeData.push(time);
        document.getElementById('concentrationInput').value = '';
        document.getElementById('timeInput').value = '';
        updateDataTable();
        plotGraph();
    } else {
        alert("Please enter valid numbers for time and concentration.");
    }
}

function updateDataTable() {
    const table = document.getElementById('dataTable');
    table.style.display = 'table';
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = '';
    concentrationData.forEach((concentration, i) => {
        const row = `<tr>
                        <td>${timeData[i]}</td>
                        <td>${concentration} ${currentUnit}</td>
                        <td><button onclick="removeData(${i})">Remove</button></td>
                    </tr>`;
        tableBody.innerHTML += row;
    });
}

function plotGraph() {
    const ctx = document.getElementById('concentrationChart').getContext('2d');
    
    if (window.myChart) {
        window.myChart.destroy();
    }
    
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeData,
            datasets: [{
                label: `${currentParameter} Data`,
                data: concentrationData,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: function(context) {
                    const chart = context.chart;
                    const {ctx, chartArea, scales} = chart;

                    if (!chartArea) {
                        return null;
                    }

                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    const yPosThreshold = scales.y.getPixelForValue(concentrationData[0]);

                    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
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
                        text: `${currentParameter} Level (${currentUnit})`
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
    concentrationData.splice(index, 1);
    timeData.splice(index, 1);
    updateDataTable();
    plotGraph();
}

function clearData() {
    concentrationData = [];
    timeData = [];
    firstConcentration = null;
    document.getElementById('dataTable').style.display = 'none';
    document.getElementById('savePdfBtn').style.display = 'none';
    document.getElementById('result').innerHTML = '';
    updateDataTable();
    if (window.myChart) window.myChart.destroy();
}

function calculateAUC() {
    if (concentrationData.length < 2 || timeData.length < 2) {
        alert("Not enough data points to calculate AUC.");
        return;
    }

    const newConcentration = concentrationData.map(value => value - concentrationData[0]);

    const tMin = Math.min(...timeData);
    const tMax = Math.max(...timeData);
    const t = [];
    for (let i = 0; i <= 1000; i++) {
        t.push(tMin + (i / 1000) * (tMax - tMin));
    }

    const nConcentration = t.map(time => {
        let leftIndex = 0;
        while (leftIndex < timeData.length - 1 && timeData[leftIndex + 1] <= time) {
            leftIndex++;
        }
        if (leftIndex === timeData.length - 1) {
            return newConcentration[leftIndex];
        }
        const rightIndex = leftIndex + 1;
        const fraction = (time - timeData[leftIndex]) / (timeData[rightIndex] - timeData[leftIndex]);
        return newConcentration[leftIndex] + fraction * (newConcentration[rightIndex] - newConcentration[leftIndex]);
    });

    const posIndices = nConcentration.map((value, index) => value > 0 ? index : -1).filter(index => index !== -1);
    const posConcentration = posIndices.map(index => nConcentration[index]);
    const posT = posIndices.map(index => t[index]);

    let auc = 0;
    for (let i = 0; i < posConcentration.length - 1; i++) {
        auc += (posConcentration[i] + posConcentration[i + 1]) * (posT[i + 1] - posT[i]) / 2;
    }

    const resultElement = document.getElementById('result');
    resultElement.innerHTML = `The AUC (Area Under the Curve) for shaded area is: ${auc.toFixed(2)} ${currentUnit} * min`;

    document.getElementById('savePdfBtn').style.display = 'inline-block';
}

async function saveToPdf() {
    if (concentrationData.length === 0 || timeData.length === 0) {
        alert("No data to save. Please add some data first.");
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text(`${currentParameter} Index Calculator Results`, 105, 15, null, null, "center");

        const columns = ["Time (min)", `${currentParameter} concentration (${currentUnit})`];
        const data = timeData.map((time, index) => [time.toString(), concentrationData[index].toString()]);
        
        doc.autoTable({
            head: [columns],
            body: data,
            startY: 25,
            styles: { fontSize: 12, cellPadding: 2 },
            headStyles: { fillColor: [200, 200, 200], textColor: 20 },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 80 }
            },
        });

        const finalY = doc.lastAutoTable.finalY || 25;

        const canvas = await html2canvas(document.getElementById('concentrationChart'));
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 10, finalY + 10, 190, 100);

        const aucValue = document.getElementById('result').innerText;
        doc.setFontSize(14);
        doc.text(aucValue, 14, finalY + 120);

        doc.save(`${currentParameter}_data.pdf`);
    } catch (error) {
        console.error('Error saving to PDF:', error);
        alert('An error occurred while saving to PDF. Please try again.');
    }
}

// Initialize labels
updateLabels();
