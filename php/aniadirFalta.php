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
    debug_log('aniadirFalta.php - Iniciando procesamiento');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido: ' . $_SERVER['REQUEST_METHOD']);
    }

    if (!isset($_POST['sala']) || !isset($_POST['fecha']) || !isset($_POST['faltas'])) {
        throw new Exception('Faltan datos requeridos');
    }

    $idSala = intval($_POST['sala']);
    $fecha = date('Y-m-d', strtotime($_POST['fecha']));
    $faltas = json_decode($_POST['faltas'], true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error al decodificar JSON: ' . json_last_error_msg());
    }

    if ($idSala <= 0 || !$fecha || !is_array($faltas)) {
        echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
        exit;
    }

    $pdo = Conexion::conectar();
    $pdo->beginTransaction();

    $conflicts = [];
    $insertCount = 0;

    if (!empty($faltas)) {
        $checkStmt = $pdo->prepare("SELECT id FROM falta WHERE idAlumno = ? AND fecha = ? AND idSala = ?");
        $insertStmt = $pdo->prepare("INSERT INTO falta (idAlumno, idSala, idRazon, fecha) VALUES (?, ?, ?, ?)");

        foreach ($faltas as $falta) {
            $idAlumno = intval($falta['alumno_id'] ?? 0);
            $idRazon  = intval($falta['razon_id'] ?? 0);
            if ($idAlumno <= 0 || $idRazon <= 0) continue;

            // Verificar si ya existe una falta para ese alumno, fecha y sala
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
                continue; // Saltar inserción duplicada
            }

            // Insertar nueva falta
            $insertStmt->execute([$idAlumno, $idSala, $idRazon, $fecha]);
            $insertCount++;
        }
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Faltas procesadas correctamente',
        'count' => $insertCount,
        'conflicts' => $conflicts
    ]);
    debug_log("Faltas insertadas: $insertCount, Conflictos: " . count($conflicts));

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
