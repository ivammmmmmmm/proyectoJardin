<?php
// Conexión a la base de datos
$conn = new mysqli('localhost', 'root', '', 'proyecto_jardin');
if ($conn->connect_error) {
    if (isset($_GET['ajax'])) {
        header('Content-Type: application/json');
        echo json_encode([]);
        exit;
    } else {
        die('Error de conexión: ' . $conn->connect_error);
    }
}

// Consulta de tutores
$sql = "SELECT id, nombre, apellido, telefono, direccion, mail FROM padretutor";
$result = $conn->query($sql);

if (isset($_GET['ajax'])) {
    header('Content-Type: application/json');
    $tutores = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $tutores[] = $row;
        }
    }
    echo json_encode($tutores);
    $conn->close();
    exit;
}

// ...existing code...
