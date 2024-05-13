function plotGraph() {
    const ctx = document.getElementById('insulinChart').getContext('2d');
    
    // Clear previous chart, if any
    if(window.myChart !== undefined)
        window.myChart.destroy();
    
    const backgroundColors = insulinData.map((level, index) => {
        if (index === 0 || level >= insulinData[0]) {
            return 'rgba(54, 162, 235, 0.2)';  // Shade color
        }
        return 'rgba(0, 0, 0, 0)';  // Transparent for lower than the first value
    });

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeData,
            datasets: [{
                label: 'Insulin Data',
                data: insulinData,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: 'origin' // This will fill to the x-axis
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
