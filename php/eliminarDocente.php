<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

// Aceptar id por POST o GET
$idRaw = $_POST['id'] ?? $_GET['id'] ?? null;
if ($idRaw === null || !ctype_digit((string)$idRaw)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de docente inválido.']);
    exit;
}

$id = (int) $idRaw;

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("DELETE FROM docente WHERE id = ?");
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta');
    }

    if (!$stmt->execute([$id])) {
        $err = $stmt->errorInfo();
        throw new Exception('Error al ejecutar DELETE docente: ' . implode(' | ', $err));
    }

    $affected = $stmt->rowCount();

    if ($affected === 0) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Docente no encontrado.']);
        exit;
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Docente eliminado correctamente.']);
    exit;

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    error_log('eliminarDocente.php error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al eliminar docente.', 'error' => $e->getMessage()]);
    exit;
}
?>