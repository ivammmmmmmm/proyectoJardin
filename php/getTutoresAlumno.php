<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

error_log('[getTutoresAlumno.php] Iniciando script');

try {
    require_once __DIR__ . '/conexion.php';

    // Obtener conexión PDO desde la clase Conexion
    $pdo = Conexion::conectar();

    // Validar ID de alumno
    $alumnoId = filter_input(INPUT_GET, 'alumnoId', FILTER_VALIDATE_INT);
    error_log("[getTutoresAlumno.php] alumnoId recibido: " . var_export($alumnoId, true));

    if (!$alumnoId) {
        throw new Exception('ID de alumno inválido o no proporcionado');
    }

    // Verificar que el alumno existe
    $checkAlumno = $pdo->prepare("SELECT id FROM alumno WHERE id = ? LIMIT 1");
    if (!$checkAlumno->execute([$alumnoId])) {
        throw new Exception('Error verificando existencia del alumno');
    }
    
    if (!$checkAlumno->fetch()) {
        throw new Exception('El alumno no existe');
    }

    error_log("[getTutoresAlumno.php] Alumno verificado correctamente");

    // Consulta principal
    $sql = "SELECT 
                pt.id,
                pt.nombre,
                pt.apellido
            FROM padretutor pt
            INNER JOIN alumnotutor at ON pt.id = at.idPadreTutor
            WHERE at.idAlumno = ?
            ORDER BY pt.apellido, pt.nombre";

    error_log("[getTutoresAlumno.php] Ejecutando consulta: " . str_replace("\n", " ", $sql));

    $stmt = $pdo->prepare($sql);
    if (!$stmt) {
        $error = $pdo->errorInfo();
        error_log("[getTutoresAlumno.php] Error preparando consulta: " . json_encode($error));
        throw new Exception('Error preparando la consulta');
    }

    if (!$stmt->execute([$alumnoId])) {
        $error = $stmt->errorInfo();
        error_log("[getTutoresAlumno.php] Error ejecutando consulta: " . json_encode($error));
        throw new Exception('Error ejecutando la consulta');
    }

    $tutores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("[getTutoresAlumno.php] Tutores encontrados: " . count($tutores));

    // Enviar respuesta
    echo json_encode([
        'status' => 'success',
        'tutores' => $tutores
    ]);
    
} catch (Exception $e) {
    error_log("[getTutoresAlumno.php] ERROR: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'error' => 'Error cargando tutores asignados'
    ]);
}