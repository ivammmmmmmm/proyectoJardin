<?php
require_once 'conexion.php';
require_once 'db_logger.php';

header('Content-Type: application/json; charset=utf-8');
logError('eliminarFalta.php', 'Iniciando proceso de eliminación');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Soportar eliminación por id OR por alumno_id+fecha
$id = $_GET['id'] ?? null;
$alumno_id = $_GET['alumno_id'] ?? null;
$fecha = $_GET['fecha'] ?? null;

if (!$id && !($alumno_id && $fecha)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['success' => false, 'error' => 'Parámetros insuficientes: proporcione id o alumno_id+fecha']);
    exit;
}

try {
    $conn = Conexion::conectar();

    if ($id) {
        logError('eliminarFalta.php', "Intentando eliminar falta con ID: $id");
        $query = "DELETE FROM falta WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
    } else {
        logError('eliminarFalta.php', "Intentando eliminar falta/presente para alumno_id: $alumno_id, fecha: $fecha");
        // La columna en la tabla 'falta' es 'idAlumno'. Eliminar en ambas tablas para asegurar que no quede registro
        $queryFalta = "DELETE FROM falta WHERE idAlumno = :alumno_id AND DATE(fecha) = DATE(:fecha)";
        $stmtF = $conn->prepare($queryFalta);
        $stmtF->bindParam(':alumno_id', $alumno_id, PDO::PARAM_INT);
        $stmtF->bindParam(':fecha', $fecha);
        $stmtF->execute();

        $queryPresente = "DELETE FROM presente WHERE idAlumno = :alumno_id AND DATE(fecha) = DATE(:fecha)";
        $stmtP = $conn->prepare($queryPresente);
        $stmtP->bindParam(':alumno_id', $alumno_id, PDO::PARAM_INT);
        $stmtP->bindParam(':fecha', $fecha);
        $stmtP->execute();

        // Reemplazamos $stmt por uno combinado para determinar el total
        $deletedF = $stmtF->rowCount();
        $deletedP = $stmtP->rowCount();
        $stmt = null; // evitar uso posterior inesperado
        $deleted = $deletedF + $deletedP;
        logError('eliminarFalta.php', "Filas eliminadas - falta: $deletedF, presente: $deletedP");
        // Construir respuesta
        echo json_encode(['success' => true, 'message' => 'Operación realizada', 'deleted_falta' => $deletedF, 'deleted_presente' => $deletedP]);
        exit;
    }

    $deleted = $stmt->rowCount();
    if ($deleted > 0) {
        logError('eliminarFalta.php', "Falta eliminada correctamente. Filas afectadas: $deleted");
        echo json_encode(['success' => true, 'message' => 'Falta eliminada correctamente', 'deleted' => $deleted]);
    } else {
        // Para hacer la operación idempotente devolvemos éxito aunque no se haya encontrado nada que eliminar.
        logError('eliminarFalta.php', "No se encontró la falta para los parámetros provistos. Filas afectadas: 0");
        echo json_encode(['success' => true, 'message' => 'No se encontró la falta (nada que eliminar)', 'deleted' => 0]);
    }

} catch (PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['success' => false, 'error' => 'Error al eliminar la falta: ' . $e->getMessage()]);
}
?>