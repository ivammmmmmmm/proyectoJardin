<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

require_once 'conexion.php';

// Recibir datos del POST
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['alumnos']) || !isset($data['fecha']) || !isset($data['idSala'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
    exit;
}

$alumnos = $data['alumnos'];
$fecha = $data['fecha'];
$idSala = $data['idSala'];

try {
    $conn = Conexion::conectar();
    
    // Preparar la consulta para insertar múltiples registros
    $stmt = $conn->prepare("INSERT INTO ausente (idAlumno, idSala, fecha) VALUES (?, ?, ?)");
    
    // Iniciar transacción
    $conn->beginTransaction();
    
    // Insertar cada registro de ausencia
    foreach ($alumnos as $idAlumno) {
        $stmt->execute([$idAlumno, $idSala, $fecha]);
    }
    
    // Confirmar la transacción
    $conn->commit();
    
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Ausentes registrados correctamente']);
    
} catch (Exception $e) {
    // Si hay error, hacer rollback
    if (isset($conn)) {
        $conn->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error al registrar ausentes: ' . $e->getMessage()
    ]);
}
?>