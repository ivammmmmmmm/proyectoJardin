<?php
header('Content-Type: application/json');
require_once 'conexion.php';

// Obtener la conexión PDO
$pdo = Conexion::conectar();

if (!isset($_POST['alumnoId']) || !isset($_POST['tutorId'])) {
    echo json_encode(['error' => 'Faltan datos requeridos']);
    exit;
}

$alumnoId = $_POST['alumnoId'];
$tutorId = $_POST['tutorId'];

try {
    // Verificar que el alumno y el tutor existen
    $stmt = $pdo->prepare("SELECT id FROM alumno WHERE id = ?");
    $stmt->execute([$alumnoId]);
    if (!$stmt->fetch()) {
        throw new Exception("El alumno no existe");
    }

    $stmt = $pdo->prepare("SELECT id FROM padretutor WHERE id = ?");
    $stmt->execute([$tutorId]);
    if (!$stmt->fetch()) {
        throw new Exception("El tutor no existe");
    }

    // Comprobar si la relación ya existe
    $stmt = $pdo->prepare("SELECT 1 FROM alumnotutor WHERE idAlumno = ? AND idPadreTutor = ?");
    $stmt->execute([$alumnoId, $tutorId]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => true, 'message' => 'La relación ya existe']);
        exit;
    }

    // Insertar la nueva relación
    $stmt = $pdo->prepare("INSERT INTO alumnotutor (idAlumno, idPadreTutor) VALUES (?, ?)");
    $stmt->execute([$alumnoId, $tutorId]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => 'Error al asignar tutor: ' . $e->getMessage()
    ]);
}
?>