<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

// Aceptar id por POST o GET
$idRaw = $_POST['id'] ?? $_GET['id'] ?? null;

// Inicializar conexión PDO
try {
    $pdo = Conexion::conectar();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos.', 'error' => $e->getMessage()]);
    exit;
}
if ($idRaw === null || !ctype_digit((string)$idRaw)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de alumno inválido.']);
    exit;
}

$id = (int) $idRaw;

// Usar transacción para consistencia
try {
    $pdo->beginTransaction();

    // Intentar eliminar vínculos en alumnotutor por alumno_id (si existe esa columna)
    try {
        $stmt = $pdo->prepare("DELETE FROM alumnotutor WHERE alumno_id = ?");
        if ($stmt) {
            $stmt->execute([$id]);
        }
    } catch (Exception $inner) {
        error_log('alumnotutor delete (alumno_id) ignored: ' . $inner->getMessage());
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM alumnotutor WHERE id = ?");
        if ($stmt) {
            $stmt->execute([$id]);
        }
    } catch (Exception $inner) {
        error_log('alumnotutor delete (id) ignored: ' . $inner->getMessage());
    }

    // Eliminar alumno
    $stmt = $pdo->prepare("DELETE FROM alumno WHERE id = ?");
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta');
    }

    if (!$stmt->execute([$id])) {
        $err = $stmt->errorInfo();
        throw new Exception('Error al ejecutar DELETE alumno: ' . implode(' | ', $err));
    }

    $affected = $stmt->rowCount();

    if ($affected === 0) {
        // No se eliminó nada: alumno no encontrado
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Alumno no encontrado.']);
        exit;
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Alumno eliminado correctamente.']);
    exit;

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    error_log('eliminar.php error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error al eliminar alumno.', 'error' => $e->getMessage()]);
    exit;
}
?>
