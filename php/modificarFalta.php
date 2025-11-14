<?php
require_once 'conexion.php';
require_once 'db_logger.php';

// Obtener la conexión PDO
$pdo = Conexion::conectar();

header('Content-Type: application/json; charset=utf-8');
logError('modificarFalta.php', 'Iniciando proceso de modificación');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logError('modificarFalta.php', 'Método no permitido: ' . $_SERVER['REQUEST_METHOD']);
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Obtener los datos del POST (se envía como FormData desde el cliente)
$faltaId = $_POST['falta_id'] ?? null; // puede estar vacío si no existía la falta
$alumnoId = $_POST['alumno_id'] ?? null;
$fecha = $_POST['fecha'] ?? null;
$estado = $_POST['estado'] ?? null; // 'presente' o 'ausente'
$idRazon = $_POST['razon_id'] ?? null;

if (!$alumnoId || !$fecha || !$estado) {
    logError('modificarFalta.php', 'Faltan datos requeridos en la solicitud');
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['success' => false, 'error' => 'Faltan datos requeridos']);
    exit;
}

try {
    $conn = Conexion::conectar();
    // Usar transacción para que las operaciones sean atómicas
    $conn->beginTransaction();
    // Obtener la sala del alumno si es necesario
    $stmtSala = $conn->prepare("SELECT idSala FROM alumno WHERE id = :alumnoId");
    $stmtSala->bindParam(':alumnoId', $alumnoId, PDO::PARAM_INT);
    $stmtSala->execute();
    $row = $stmtSala->fetch(PDO::FETCH_ASSOC);
    $idSala = $row['idSala'] ?? null;

    if ($estado === 'ausente') {
        // Cambiar a ausente
        // Primero, si existe un registro 'presente', eliminarlo
        $checkPresente = $conn->prepare("SELECT id FROM presente WHERE idAlumno = :alumnoId AND DATE(fecha) = DATE(:fecha)");
        $checkPresente->bindParam(':alumnoId', $alumnoId, PDO::PARAM_INT);
        $checkPresente->bindParam(':fecha', $fecha);
        $checkPresente->execute();
        $existingPresente = $checkPresente->fetch(PDO::FETCH_ASSOC);

        if ($existingPresente) {
            // Eliminar el registro de presente
            $deletePresente = $conn->prepare("DELETE FROM presente WHERE id = :id");
            $deletePresente->bindParam(':id', $existingPresente['id'], PDO::PARAM_INT);
            $deletePresente->execute();
            logError('modificarFalta.php', "Registro de presente eliminado para alumno $alumnoId en fecha $fecha");
        }

        // Ahora comprobar si ya existe una falta para ese alumno+fecha
        $checkFalta = $conn->prepare("SELECT id FROM falta WHERE idAlumno = :alumnoId AND DATE(fecha) = DATE(:fecha)");
        $checkFalta->bindParam(':alumnoId', $alumnoId, PDO::PARAM_INT);
        $checkFalta->bindParam(':fecha', $fecha);
        $checkFalta->execute();
        $existingFalta = $checkFalta->fetch(PDO::FETCH_ASSOC);

            if ($existingFalta) {
                // Si existe, actualizar en lugar de insertar
                $updateQuery = "UPDATE falta SET idSala = :idSala, idRazon = :idRazon WHERE id = :id";
                $updateStmt = $conn->prepare($updateQuery);
                if ($idSala) {
                    $updateStmt->bindValue(':idSala', $idSala, PDO::PARAM_INT);
                } else {
                    $updateStmt->bindValue(':idSala', null, PDO::PARAM_NULL);
                }
                if ($idRazon) {
                    $updateStmt->bindValue(':idRazon', $idRazon, PDO::PARAM_INT);
                } else {
                    $updateStmt->bindValue(':idRazon', null, PDO::PARAM_NULL);
                }
                $updateStmt->bindParam(':id', $existingFalta['id'], PDO::PARAM_INT);
                $updateStmt->execute();
                $conn->commit();
                echo json_encode(['success' => true, 'message' => 'Falta actualizada correctamente']);
                exit;
            } else {
                // No existe falta, insertar nueva
                $query = "INSERT INTO falta (idAlumno, idSala, fecha, idRazon) VALUES (:alumnoId, :idSala, :fecha, :idRazon)";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':alumnoId', $alumnoId, PDO::PARAM_INT);
                // idSala puede ser null
                if ($idSala) {
                    $stmt->bindValue(':idSala', $idSala, PDO::PARAM_INT);
                } else {
                    $stmt->bindValue(':idSala', null, PDO::PARAM_NULL);
                }
                $stmt->bindParam(':fecha', $fecha);
                if ($idRazon) {
                    $stmt->bindValue(':idRazon', $idRazon, PDO::PARAM_INT);
                } else {
                    $stmt->bindValue(':idRazon', null, PDO::PARAM_NULL);
                }
                $stmt->execute();
                $conn->commit();
                echo json_encode(['success' => true, 'message' => 'Falta registrada correctamente']);
                exit;
            }
    } else {
        // estado === 'presente'
        // Cambiar a presente
        // Primero, si existe un registro 'falta', eliminarlo
        $checkFalta = $conn->prepare("SELECT id FROM falta WHERE idAlumno = :alumnoId AND DATE(fecha) = DATE(:fecha)");
        $checkFalta->bindParam(':alumnoId', $alumnoId, PDO::PARAM_INT);
        $checkFalta->bindParam(':fecha', $fecha);
        $checkFalta->execute();
        $existingFalta = $checkFalta->fetch(PDO::FETCH_ASSOC);

        if ($existingFalta) {
            // Eliminar el registro de falta
            $deleteFalta = $conn->prepare("DELETE FROM falta WHERE id = :id");
            $deleteFalta->bindParam(':id', $existingFalta['id'], PDO::PARAM_INT);
            $deleteFalta->execute();
            logError('modificarFalta.php', "Registro de falta eliminado para alumno $alumnoId en fecha $fecha");
        }

        // Insertar o actualizar presente
        // Comprobar si ya existe registro en 'presente' para ese alumno+fecha
        $checkQuery = "SELECT id FROM presente WHERE idAlumno = :alumnoId AND DATE(fecha) = DATE(:fecha)";
        $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':alumnoId', $alumnoId, PDO::PARAM_INT);
    $checkStmt->bindParam(':fecha', $fecha);
        $checkStmt->execute();
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            // Ya existe presente, nada que hacer
            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Registro de presente existente']);
            exit;
        } else {
            // Insertar presente
            $insertQuery = "INSERT INTO presente (idAlumno, idSala, fecha) VALUES (:alumnoId, :idSala, :fecha)";
            $insertStmt = $conn->prepare($insertQuery);
            $insertStmt->bindParam(':alumnoId', $alumnoId, PDO::PARAM_INT);
            if ($idSala) {
                $insertStmt->bindValue(':idSala', $idSala, PDO::PARAM_INT);
            } else {
                $insertStmt->bindValue(':idSala', null, PDO::PARAM_NULL);
            }
            $insertStmt->bindParam(':fecha', $fecha);
            $insertStmt->execute();
            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Presente registrado correctamente']);
            exit;
        }
    }
    
} catch (PDOException $e) {
    if ($conn && $conn->inTransaction()) {
        $conn->rollBack();
    }
    header('HTTP/1.1 500 Internal Server Error');
    logError('modificarFalta.php', 'Error PDO: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error al modificar la asistencia: ' . $e->getMessage()]);
}
?>