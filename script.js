let concentrationData = [];
let timeData = [];
let firstConcentration = null;
let currentParameter = 'glucose';
let currentUnit = 'g/dL';

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
    updateDataTable(); // Update the table when units change
}

function updateUnitOptions() {
    const glucoseUnits = document.getElementById('glucoseUnits');
    const insulinUnits = document.getElementById('insulinUnits');
    
    currentParameter = getSelectedParameter();
    
    if (currentParameter === 'glucose') {
        glucoseUnits.style.display = 'flex';
        insulinUnits.style.display = 'none';
        document.querySelector('input[name="unit"][value="g/dL"]').checked = true;
    } else {
        glucoseUnits.style.display = 'none';
        insulinUnits.style.display = 'flex';
        document.querySelector('input[name="unit"][value="μIU/mL"]').checked = true;
    }
    
    updateLabels();
}

function updateDataTable() {
    const table = document.getElementById('dataTable');
    if (concentrationData.length === 0) {
        table.style.display = 'none';
        return;
    }
    table.style.display = 'table';
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = '';
    concentrationData.forEach((concentration, i) => {
        const row = `<tr>
                        <td>${timeData[i]}</td>
                        <td>${concentration} ${currentUnit}</td>
                        <td>
                            <button onclick="removeData(${i})" class="remove-btn">Remove</button>
                            <button onclick="enableEdit(${i})" class="modify-btn">Modify</button>
                        </td>
                    </tr>`;
        tableBody.innerHTML += row;
    });
}

function initializeEventListeners() {
    document.querySelectorAll('input[name="parameter"]').forEach(radio => {
        radio.addEventListener('change', updateUnitOptions);
    });

    document.querySelectorAll('input[name="unit"]').forEach(radio => {
        radio.addEventListener('change', updateLabels);
    });
}

document.querySelectorAll('input[name="parameter"]').forEach(radio => {
    radio.addEventListener('change', updateUnitOptions);
});

document.querySelectorAll('input[name="unit"]').forEach(radio => {
    radio.addEventListener('change', updateLabels);
});

function addData() {
    const concentration = parseFloat(document.getElementById('concentrationInput').value);
    const time = parseFloat(document.getElementById('timeInput').value);
    
    if (!isNaN(concentration) && !isNaN(time)) {
        if (firstConcentration === null && concentrationData.length === 0) {
            firstConcentration = concentration;
        }
        
        // Find the correct position to insert the new data
        let insertIndex = timeData.findIndex(t => t > time);
        if (insertIndex === -1) insertIndex = timeData.length;
        
        // Insert the new data at the correct position
        timeData.splice(insertIndex, 0, time);
        concentrationData.splice(insertIndex, 0, concentration);
        
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
                        <td>
                            <button onclick="removeData(${i})" class="remove-btn">Remove</button>
                            <button onclick="enableEdit(${i})" class="modify-btn">Modify</button>
                        </td>
                    </tr>`;
        tableBody.innerHTML += row;
    });
}

function enableEdit(index) {
    const row = document.querySelector(`#dataTable tbody tr:nth-child(${index + 1})`);
    const timeCell = row.cells[0];
    const concentrationCell = row.cells[1];
    const actionCell = row.cells[2];

    const timeValue = timeData[index];
    const concentrationValue = concentrationData[index];

    timeCell.innerHTML = `<input type="number" value="${timeValue}" step="0.01" min="0" class="edit-input">`;
    concentrationCell.innerHTML = `<input type="number" value="${concentrationValue}" step="0.01" min="0" class="edit-input">`;
    actionCell.innerHTML = `
        <button onclick="saveEdit(${index})" class="save-btn">Save</button>
        <button onclick="cancelEdit(${index})" class="cancel-btn">Cancel</button>
    `;
}

function saveEdit(index) {
    const row = document.querySelector(`#dataTable tbody tr:nth-child(${index + 1})`);
    const newTime = parseFloat(row.cells[0].querySelector('input').value);
    const newConcentration = parseFloat(row.cells[1].querySelector('input').value);

    if (!isNaN(newTime) && !isNaN(newConcentration)) {
        // Remove the old data
        timeData.splice(index, 1);
        concentrationData.splice(index, 1);

        // Find the correct position to insert the modified data
        let insertIndex = timeData.findIndex(t => t > newTime);
        if (insertIndex === -1) insertIndex = timeData.length;

        // Insert the modified data
        timeData.splice(insertIndex, 0, newTime);
        concentrationData.splice(insertIndex, 0, newConcentration);

        updateDataTable();
        plotGraph();
    } else {
        alert("Please enter valid numbers for time and concentration.");
    }
}

function cancelEdit(index) {
    updateDataTable();
}

function modifyData(index) {
    const newTime = prompt("Enter new time value:", timeData[index]);
    const newConcentration = prompt("Enter new concentration value:", concentrationData[index]);
    
    if (newTime !== null && newConcentration !== null) {
        const parsedTime = parseFloat(newTime);
        const parsedConcentration = parseFloat(newConcentration);
        
        if (!isNaN(parsedTime) && !isNaN(parsedConcentration)) {
            // Remove the old data
            timeData.splice(index, 1);
            concentrationData.splice(index, 1);
            
            // Find the correct position to insert the modified data
            let insertIndex = timeData.findIndex(t => t > parsedTime);
            if (insertIndex === -1) insertIndex = timeData.length;
            
            // Insert the modified data
            timeData.splice(insertIndex, 0, parsedTime);
            concentrationData.splice(insertIndex, 0, parsedConcentration);
            
            updateDataTable();
            plotGraph();
        } else {
            alert("Please enter valid numbers for time and concentration.");
        }
    }
}

function removeData(index) {
    concentrationData.splice(index, 1);
    timeData.splice(index, 1);
    updateDataTable();
    plotGraph();
    if (concentrationData.length === 0) {
        clearGraph();
    }
}

function clearData() {
    concentrationData = [];
    timeData = [];
    firstConcentration = null;
    document.getElementById('dataTable').style.display = 'none';
    document.getElementById('savePdfBtn').style.display = 'none';
    document.getElementById('result').innerHTML = '';
    updateDataTable();
    clearGraph();
}

function clearGraph() {
    const ctx = document.getElementById('concentrationChart').getContext('2d');
    if (window.myChart) {
        window.myChart.destroy();
    }
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function plotGraph() {
    const ctx = document.getElementById('concentrationChart').getContext('2d');
    
    if (window.myChart) {
        window.myChart.destroy();
    }
    
    if (concentrationData.length === 0) {
        clearGraph();
        return;
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

        // Capitalize the first letter of the parameter
        const capitalizedParameter = currentParameter.charAt(0).toUpperCase() + currentParameter.slice(1);

        // Fix for μIU/mL display
        const displayUnit = currentUnit === 'μIU/mL' ? 'uIU/mL' : currentUnit;

        doc.setFontSize(16);
        doc.text(`${capitalizedParameter} Index Calculator Results`, 105, 15, null, null, "center");

        const columns = ["Time (min)", `${capitalizedParameter} concentration (${displayUnit})`];
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

        const aucValue = document.getElementById('result').innerText.replace('μIU/mL', 'uIU/mL');
        doc.setFontSize(14);
        doc.text(aucValue, 14, finalY + 120);

        doc.save(`${capitalizedParameter}_data.pdf`);
    } catch (error) {
        console.error('Error saving to PDF:', error);
        alert('An error occurred while saving to PDF. Please try again.');
    }
}

function openTab(evt, tabName) {
    var i, tabContent, tabButtons;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    tabButtons = document.getElementsByClassName("tab-button");
    for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set the Calculate tab as active by default
    document.querySelector('.tab-button[onclick="openTab(event, \'calculate\')"]').click();
});
