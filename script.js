let insulinData = [];
let timeData = [];
let firstInsulin = null;  // Variable to hold the first insulin value

function addData() {
    const insulinLevel = parseFloat(document.getElementById('insulinInput').value);
    const time = parseFloat(document.getElementById('timeInput').value);
    
    // Check if the inputs are numbers and not NaN (Not a Number)
    if (!isNaN(insulinLevel) && !isNaN(time)) {
        // Check if the first insulin value has not been set yet
        if (firstInsulin === null && insulinData.length === 0) {
            firstInsulin = insulinLevel; // Set the first insulin value if this is the first entry
        }
        insulinData.push(insulinLevel); // Add insulin level to the array
        timeData.push(time); // Add time to the array
        document.getElementById('insulinInput').value = ''; // Clear the insulin input field
        document.getElementById('timeInput').value = ''; // Clear the time input field
        updateDataTable(); // Update the data table on the webpage
        plotGraph(); // Plot or update the graph with the new data
    } else {
        alert("Please enter valid numbers for time and insulin concentration."); // Alert if the input values are not numbers
    }
}


function updateDataTable() {
    const table = document.getElementById('dataTable');
    table.style.display = 'table'; // Make sure the table is visible
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
                    const yPosThreshold = scales.y.getPixelForValue(firstInsulin);

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
                    tension: 0  // This makes the line straight (no curves)
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
    updateDataTable();
    if (window.myChart) window.myChart.destroy();
}
