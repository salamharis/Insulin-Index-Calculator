let insulinData = [];
let timeData = [];
let firstInsulin = null;

function addData() {
    const insulinLevel = parseFloat(document.getElementById('insulinInput').value);
    const time = parseFloat(document.getElementById('timeInput').value);
    
    if (!isNaN(insulinLevel) && !isNaN(time) && time >= 0) {
        if (firstInsulin === null) firstInsulin = insulinLevel;
        insulinData.push(insulinLevel);
        timeData.push(time);
        document.getElementById('insulinInput').value = '';
        document.getElementById('timeInput').value = '';
        updateDataTable();
    } else {
        alert("Please enter valid numbers for time and insulin concentration.");
    }
}

function updateDataTable() {
    const table = document.getElementById('dataTable');
    table.style.display = 'table'; // Show table
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
    
    if(window.myChart !== undefined)
        window.myChart.destroy();
    
    const shadedAreas = insulinData.map(data => data >= firstInsulin ? 'rgba(54, 162, 235, 0.2)' : 'rgba(0, 0, 0, 0)');

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeData,
            datasets: [{
                label: 'Insulin Data',
                data: insulinData,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: shadedAreas,
                borderWidth: 1,
                fill: true
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

function clearData() {
    insulinData = [];
    timeData = [];
    firstInsulin = null;
    document.getElementById('dataTable').style.display = 'none'; // Hide table
    updateDataTable();
    if(window.myChart !== undefined) window.myChart.destroy();
}
