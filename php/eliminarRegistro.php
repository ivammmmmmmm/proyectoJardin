<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT) ?? 
      filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de registro inválido']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM comunicado WHERE id = ?");
    if (!$stmt) {
        throw new Exception('Error preparando la consulta');
    }

    if (!$stmt->execute([$id])) {
        throw new Exception('Error al eliminar: ' . implode(' | ', $stmt->errorInfo()));
    }

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Registro no encontrado']);
        exit;
    }

    echo json_encode(['success' => true, 'message' => 'Registro eliminado correctamente']);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}