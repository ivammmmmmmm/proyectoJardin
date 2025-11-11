<?php
// modificarTutor.php
// Actualiza un registro de padretutor a partir de POST (form-data)

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    require_once 'conexion.php';
    $pdo = Conexion::conectar();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        exit;
    }

    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
    $apellido = isset($_POST['apellido']) ? trim($_POST['apellido']) : '';
    // El formulario envía 'dni' pero la tabla padretutor no lo tiene. Lo ignoramos si viene.
    $telefono = isset($_POST['telefono']) ? trim($_POST['telefono']) : null;
    $direccion = isset($_POST['direccion']) ? trim($_POST['direccion']) : null;
    $mail = isset($_POST['mail']) ? trim($_POST['mail']) : null;
    $idLocalidad = isset($_POST['idLocalidad']) && $_POST['idLocalidad'] !== '' ? intval($_POST['idLocalidad']) : null;

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID inválido']);
        exit;
    }

    if ($nombre === '' || $apellido === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Nombre y apellido son requeridos']);
        exit;
    }

    // Construir la consulta dinámicamente para no romper si faltan columnas opcionales
    $fields = ['nombre = ?', 'apellido = ?'];
    $values = [$nombre, $apellido];

    if ($telefono !== null) {
        $telefono_val = $telefono === '' ? null : intval($telefono);
        $fields[] = 'telefono = ?';
        $values[] = $telefono_val;
    }

    if ($direccion !== null) {
        $fields[] = 'direccion = ?';
        $values[] = $direccion;
    }

    if ($mail !== null) {
        $fields[] = 'mail = ?';
        $values[] = $mail;
    }

    if ($idLocalidad !== null) {
        $fields[] = 'idLocalidad = ?';
        $values[] = $idLocalidad;
    }

    $sql = 'UPDATE padretutor SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $values[] = $id;

    $stmt = $pdo->prepare($sql);
    if (!$stmt) {
        throw new Exception('Error preparando la consulta');
    }

    if (!$stmt->execute($values)) {
        $err = $stmt->errorInfo();
        throw new Exception('Error ejecutando la consulta: ' . implode(' | ', $err));
    }

    $affected = $stmt->rowCount();

    echo json_encode(['success' => true, 'message' => 'Tutor actualizado correctamente', 'affected' => $affected]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    error_log('modificarTutor.php exception: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error del servidor']);
    exit;
}

?>