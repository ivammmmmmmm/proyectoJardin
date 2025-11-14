<?php
header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('America/Santiago');
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');
error_reporting(E_ALL);

function debug_log($message) {
    error_log(date('[Y-m-d H:i:s] ') . print_r($message, true) . "\n", 3, __DIR__ . '/debug.log');
}

require_once __DIR__ . '/conexion.php';

// Obtener la conexión PDO
$pdo = Conexion::conectar();

try {
    debug_log('aniadirPresente.php - Iniciando procesamiento');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido: ' . $_SERVER['REQUEST_METHOD']);
    }

    if (!isset($_POST['sala']) || !isset($_POST['fecha']) || !isset($_POST['presentes'])) {
        throw new Exception('Faltan datos requeridos');
    }

    $idSala = intval($_POST['sala']);
    $fecha = date('Y-m-d', strtotime($_POST['fecha']));
    $presentes = json_decode($_POST['presentes'], true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error al decodificar JSON: ' . json_last_error_msg());
    }

    if ($idSala <= 0 || !$fecha || !is_array($presentes)) {
        echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
        exit;
    }

    $pdo = Conexion::conectar();
    $pdo->beginTransaction();

    $conflicts = [];
    $insertCount = 0;

    if (!empty($presentes)) {
        $checkStmt = $pdo->prepare("SELECT id FROM presente WHERE idAlumno = ? AND fecha = ? AND idSala = ?");
        $insertStmt = $pdo->prepare("INSERT INTO presente (idAlumno, idSala, fecha) VALUES (?, ?, ?)");

        foreach ($presentes as $presente) {
            $idAlumno = intval($presente['alumno_id'] ?? 0);
            if ($idAlumno <= 0) continue;

            // Verificar si ya existe un registro para ese alumno en esa fecha
            $checkStmt->execute([$idAlumno, $fecha, $idSala]);
            if ($checkStmt->fetch()) {
                // Obtener nombre del alumno
                $nombreStmt = $pdo->prepare("SELECT CONCAT(apellido, ', ', nombre) FROM alumno WHERE id = ?");
                $nombreStmt->execute([$idAlumno]);
                $nombre = $nombreStmt->fetchColumn() ?: "ID $idAlumno";

                $conflicts[] = [
                    'alumno_id' => $idAlumno,
                    'message' => "El alumno $nombre ya fue registrado el día $fecha"
                ];
                continue; // No volver a insertarlo
            }

            // Insertar nuevo presente
            $insertStmt->execute([$idAlumno, $idSala, $fecha]);
            $insertCount++;
        }
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Se han registrado ' . $insertCount . ' alumnos presentes correctamente',
        'count' => $insertCount,
        'conflicts' => $conflicts
    ]);
    debug_log("Presentes insertados: $insertCount, Conflictos: " . count($conflicts));

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    debug_log('Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
