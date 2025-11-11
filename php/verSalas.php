<?php
require_once 'conexion.php';

// Verificar si es una petición AJAX
$isAjax = isset($_GET['ajax']) && $_GET['ajax'] == '1';

try {
    $sql = "SELECT id, nombre FROM sala ORDER BY id";
    $stmt = $pdo->query($sql);
    if (!$stmt) throw new Exception("Error al obtener las salas");

    $salas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($isAjax) {
        // Si es una petición AJAX, devolver JSON
        header('Content-Type: application/json');
        echo json_encode($salas);
    } else {
        // Si no es AJAX, mostrar la lista de salas
        foreach ($salas as $sala) {
            echo "Sala " . htmlspecialchars($sala['nombre']) . "<br>";
        }
    }

} catch (Exception $e) {
    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Error al obtener las salas: ' . $e->getMessage()]);
    } else {
        echo "Error: " . $e->getMessage();
    }
}
?>