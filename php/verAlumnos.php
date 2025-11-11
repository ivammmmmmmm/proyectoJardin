<?php
header('Content-Type: application/json; charset=utf-8');
require_once("conexion.php");

try {
    $query = "SELECT id, nombre, apellido FROM alumno ORDER BY apellido, nombre";
    $stmt = $pdo->query($query);
    if (!$stmt) throw new Exception("Error al obtener los alumnos");

    $alumnos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($alumnos);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>