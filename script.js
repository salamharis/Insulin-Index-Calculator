body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    color: #333;
}

.container {
    max-width: 960px;
    margin: auto;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 6px 10px rgba(0,0,0,0.1);
}

header {
    padding: 20px 0;
    text-align: center;
}

.calculator {
    margin: 20px 0;
}

.input-group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 20px;
}

.input-group label, .input-group input, button {
    margin: 5px;
}

button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #0056b3;
}

.chart-container {
    width: 100%;
    height: 400px;
}

#dataTable {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

#dataTable th, #dataTable td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
}

#dataTable th {
    background-color: #f9f9f9;
}

footer {
    text-align: center;
    padding: 20px 0;
}

.developers-team h2 {
    margin-bottom: 10px;
}

.developers-team ul {
    list-style-type: none;
    padding: 0;
}
