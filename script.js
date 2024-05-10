function calculateInsulinemicIndex() {
    var testFoodIAUC = parseFloat(document.getElementById('testFood').value);
    var refFoodIAUC = parseFloat(document.getElementById('refFood').value);
    var insulinemicIndex = (testFoodIAUC / refFoodIAUC) * 100;
    var resultElement = document.getElementById('result');

    if (!isNaN(insulinemicIndex)) {
        resultElement.innerHTML = 'The Insulinemic Index is: ' + insulinemicIndex.toFixed(2);
    } else {
        resultElement.innerHTML = 'Please enter valid values for iAUC of Test Food and iAUC of Ref Food.';
    }
}

