<?php
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once 'conexion.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        exit;
    }

    if (!isset($pdo)) {
        throw new Exception('No se pudo establecer la conexión a la base de datos');
    }

    // Obtener y validar datos
    $data = $_POST;
    $id = isset($data['id']) ? intval($data['id']) : 0;
    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID de registro inválido']);
        exit;
    }

    // Validar campos requeridos (permitir desarrollo vacío)
    $requiredFields = ['alumno_id', 'tutor_id', 'docente_id', 'sala_id', 'medioUtilizado', 'causa'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            echo json_encode(['success' => false, 'message' => "Campo requerido faltante: $field"]);
            exit;
        }
    }

    // Validar longitudes de campos
    if (mb_strlen($data['medioUtilizado']) > 25 || mb_strlen($data['causa']) > 25) {
        throw new Exception('Los campos no deben exceder 25 caracteres');
    }

    $stmt = $pdo->prepare("UPDATE comunicado SET 
        idAlumno = :alumno,
        idPadreTutor = :tutor,
        idDocente = :docente,
        idSala = :sala,
        medioUtilizado = :medio,
        causa = :causa,
        desarrollo = :desarrollo
        WHERE id = :id");

    $result = $stmt->execute([
        ':alumno' => intval($data['alumno_id']),
        ':tutor' => intval($data['tutor_id']),
        ':docente' => intval($data['docente_id']),
        ':sala' => intval($data['sala_id']),
        ':medio' => $data['medioUtilizado'],
        ':causa' => $data['causa'],
        ':desarrollo' => $data['desarrollo'] ?? '',
        ':id' => $id
    ]);

    if ($result && $stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Registro actualizado exitosamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontró el registro o no hubo cambios']);
    }

} catch (Exception $e) {
    error_log('[editarRegistro.php] Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al actualizar registro: ' . $e->getMessage()]);
}

?>