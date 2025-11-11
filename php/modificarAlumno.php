<?php
// modificarAlumno.php
// Actualiza un alumno desde POST (se espera FormData)

ini_set('display_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

try {
    require_once 'conexion.php';
    $pdo = Conexion::conectar();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        exit;
    }

    // Obtener y validar campos
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
    $apellido = isset($_POST['apellido']) ? trim($_POST['apellido']) : '';
    $dni = isset($_POST['dni']) ? trim($_POST['dni']) : '';
    $direccion = isset($_POST['direccion']) ? trim($_POST['direccion']) : '';
    $fecha_nacimiento = isset($_POST['fecha_nacimiento']) ? trim($_POST['fecha_nacimiento']) : '';

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

    // Validar formato de fecha (opcional)
    if ($fecha_nacimiento !== '') {
        $d = DateTime::createFromFormat('Y-m-d', $fecha_nacimiento);
        if (!($d && $d->format('Y-m-d') === $fecha_nacimiento)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Formato de fecha inválido (YYYY-MM-DD)']);
            exit;
        }
    }

    // Empezar transacción para actualizar alumno y relaciones con tutores
    $pdo->beginTransaction();

    // Preparar actualización del alumno
    $stmt = $pdo->prepare("UPDATE alumno SET nombre = ?, apellido = ?, dni = ?, direccion = ?, fecha_nacimiento = ? WHERE id = ?");
    if (!$stmt) {
        throw new Exception('Error preparando la consulta');
    }

    if (!$stmt->execute([$nombre, $apellido, $dni, $direccion, $fecha_nacimiento, $id])) {
        throw new Exception('Error ejecutando la consulta');
    }

    // Procesar tutores (esperado como array en POST: tutores[])
    $tutores = [];
    if (isset($_POST['tutores']) && is_array($_POST['tutores'])) {
        foreach ($_POST['tutores'] as $t) {
            // aceptar sólo valores numéricos
            if (ctype_digit((string)$t)) $tutores[] = (int)$t;
        }
    }

    if (empty($tutores)) {
        // No se permite dejar al alumno sin tutores
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Debe asignar al menos un tutor al alumno']);
        exit;
    }

   // Validar que los tutores existen en la tabla padretutor
$stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM padretutor WHERE id = ?");
if (!$stmtCheck) {
    throw new Exception('Error preparando comprobación de tutores');
}
foreach ($tutores as $tid) {
    if (!$stmtCheck->execute([$tid])) {
        throw new Exception('Error comprobando tutor');
    }
    $cnt = $stmtCheck->fetchColumn();
    if ($cnt == 0) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Tutor con id $tid no existe"]);
        exit;
    }
}
$stmtCheck->closeCursor();

// Borrar vínculos previos en alumnotutor para este alumno
$stmtDel = $pdo->prepare("DELETE FROM alumnotutor WHERE idAlumno = ?");
if (!$stmtDel->execute([$id])) {
    throw new Exception('Error eliminando relaciones anteriores');
}

// Insertar nuevas relaciones
$stmtIns = $pdo->prepare("INSERT INTO alumnotutor (idPadreTutor, idAlumno) VALUES (?, ?)");
foreach ($tutores as $tid) {
    if (!$stmtIns->execute([$tid, $id])) {
        throw new Exception('Error insertando relación alumno-tutor');
    }
}

// Confirmar cambios
$pdo->commit();

echo json_encode(['success' => true, 'message' => 'Alumno actualizado correctamente']);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('modificarAlumno.php exception: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
}
?>
