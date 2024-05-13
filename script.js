let insulinData = [];
let timeData = [];
let firstInsulin = null;  // To store the first insulin value as the threshold

function addData() {
    const insulinLevel = parseFloat(document.getElementById('insulinInput').value);
    const time = parseFloat(document.getElementById('timeInput').value);
    
    if (!isNaN(insulinLevel) && !isNaN(time) && time >= 0) {
        if (firstInsulin === null) firstInsulin = insulinLevel;  // Set first insulin value if not already set
        insulinData.push(insulinLevel);
        timeData.push(time);
        document.getElementById('insulinInput').value = '';
        document.getElementById('timeInput').value = '';
        updateDataTable();
        if (insulinData.length === 1) { // Only plot if there's at least one data point
            plotGraph();  // Automatically plot graph upon first data entry
        }
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
    
    // Clear previous chart, if any
    if (window.myChart) {
        window.myChart.destroy();
    }
    
    const threshold = 20; // Set your threshold value here

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
                    const {ctx, chartArea} = chart;

                    if (!chartArea) {
                        // This case happens on initial chart load
                        return null;
                    }
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // Transparent below the threshold
                    gradient.addColorStop(Math.max(0, (threshold - chart.scales.y.min) / (chart.scales.y.max - chart.scales.y.min)), 'rgba(54, 162, 235, 0.2)');
                    gradient.addColorStop(1, 'rgba(54, 162, 235, 0.2)'); // Color above the threshold

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
                    tension: 0 // Disables bezier curves
                }
            },
            plugins: {
                filler: {
                    propagate: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
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
