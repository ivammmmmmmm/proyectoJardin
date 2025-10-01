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

// Consulta de alumnos
$sql = "SELECT id, nombre, apellido, dni, direccion, fecha_nacimiento FROM alumno";
$result = $conn->query($sql);

if (isset($_GET['ajax'])) {
	header('Content-Type: application/json');
	$alumnos = [];
	if ($result && $result->num_rows > 0) {
		while ($row = $result->fetch_assoc()) {
			$alumnos[] = $row;
		}
	}
	echo json_encode($alumnos);
	$conn->close();
	exit;
}

// ...existing code...
?>
