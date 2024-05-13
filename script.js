let insulinData = [];
let timeData = [];
let minInsulin = Infinity;

function addData() {
    const insulinLevel = parseFloat(document.getElementById('insulinInput').value);
    const time = parseFloat(document.getElementById('timeInput').value);
    
    if (!isNaN(insulinLevel) && !isNaN(time) && insulinLevel > 0 && time >= 0) {
        insulinData.push(insulinLevel);
        timeData.push(time);
        if (insulinLevel < minInsulin) minInsulin = insulinLevel;
        document.getElementById('insulinInput').value = '';
        document.getElementById('timeInput').value = '';
        updateDataTable();
    } else {
        alert("Please enter valid numbers for time and insulin concentration.");
    }
}

function updateDataTable() {
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = '';
    insulinData.forEach((insulin, i) => {
        const row = `<tr>
                        <td>${timeData[i]}</td>
                        <td>${insulin}</td>
                    </tr>`;
        tableBody.innerHTML += row;
    });
}

function plotGraph() {
    const ctx = document.getElementById('insulinChart').getContext('2d');
    
    if(window.myChart !== undefined)
        window.myChart.destroy();
    
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeData,
            datasets: [{
                label: 'Insulin Data',
                data: insulinData,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 1,
                fill: {
                    target: 'origin',
                    above: 'rgba(54, 162, 235, 0.2)', // Shade above minimum
                    below: 'rgba(255, 255, 255, 0)' // Transparent below minimum
                }
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
                    }
                }
            }
        }
    });
}

function calculateAUC() {
    let auc = 0;
    for (let i = 0; i < insulinData.length - 1; i++) {
        auc += (insulinData[i] + insulinData[i + 1]) / 2 * (timeData[i + 1] - timeData[i]);
    }
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = 'The AUC (Area Under the Curve) is: ' + auc.toFixed(2);
}
