let insulinData = [];
let timeData = [];

function addData() {
    const insulinLevel = parseFloat(document.getElementById('insulinInput').value);
    const time = parseFloat(document.getElementById('timeInput').value);
    
    if (!isNaN(insulinLevel) && !isNaN(time)) {
        insulinData.push(insulinLevel);
        timeData.push(time);
        document.getElementById('insulinInput').value = '';
        document.getElementById('timeInput').value = '';
        updateDataTable();
    }
}

function updateDataTable() {
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = '';

    for (let i = 0; i < insulinData.length; i++) {
        const row = `<tr>
                        <td>${timeData[i]}</td>
                        <td>${insulinData[i]}</td>
                    </tr>`;
        tableBody.innerHTML += row;
    }
}

function plotGraph() {
    // Get canvas context
    const ctx = document.getElementById('insulinChart').getContext('2d');
    
    // Clear previous chart, if any
    if(window.myChart !== undefined)
        window.myChart.destroy();
    
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeData,
            datasets: [{
                label: 'Insulin Data',
                data: insulinData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Insulin Level'
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

