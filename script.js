// Initialize global arrays to store data
let insulinData = [];
let timeData = [];
let firstInsulin = null;

// Function to add data
function addData() {
    const insulinLevel = parseFloat(document.getElementById('insulinInput').value);
    const time = parseFloat(document.getElementById('timeInput').value);
@@ -21,6 +23,7 @@ function addData() {
    }
}

// Function to update the data table
function updateDataTable() {
    const table = document.getElementById('dataTable');
    table.style.display = 'table';
@@ -30,12 +33,16 @@ function updateDataTable() {
        const row = `<tr>
                        <td>${timeData[i]}</td>
                        <td>${insulin}</td>
                        <td><button onclick="removeData(${i})">Remove</button></td>
                        <td>
                            <button onclick="removeData(${i})">Remove</button>
                            <button onclick="editData(${i})">Edit</button>
                        </td>
                    </tr>`;
        tableBody.innerHTML += row;
    });
}

// Function to plot the graph
function plotGraph() {
    const ctx = document.getElementById('insulinChart').getContext('2d');

@@ -100,13 +107,28 @@ function plotGraph() {
    });
}

// Function to remove data entry
function removeData(index) {
    insulinData.splice(index, 1);
    timeData.splice(index, 1);
    updateDataTable();
    plotGraph();
}

// Function to edit data entry
function editData(index) {
    const timeInput = document.getElementById('timeInput');
    const insulinInput = document.getElementById('insulinInput');

    // Populate inputs with current data for editing
    timeInput.value = timeData[index];
    insulinInput.value = insulinData[index];

    // Remove the data entry from arrays
    removeData(index);
}

// Function to clear all data
function clearData() {
    insulinData = [];
    timeData = [];
@@ -118,6 +140,7 @@ function clearData() {
    if (window.myChart) window.myChart.destroy();
}

// Function to calculate AUC
function calculateAUC() {
    if (insulinData.length < 2 || timeData.length < 2) {
        alert("Not enough data points to calculate AUC.");
@@ -167,6 +190,7 @@ function calculateAUC() {
    document.getElementById('savePdfBtn').style.display = 'inline-block';
}

// Function to save data to PDF
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
