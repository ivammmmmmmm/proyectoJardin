<?php
// Prevenir cualquier salida antes de los headers
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Asegurar que no haya salida de errores PHP
function exception_error_handler($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
}
set_error_handler("exception_error_handler");

// Asegurar que siempre enviemos un JSON válido
function enviarJSON($data, $codigo = 200) {
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

try {
    require_once 'conexion.php';

    if (!isset($_GET['tutorId']) || empty($_GET['tutorId'])) {
        throw new Exception('No se proporcionó ID del tutor');
    }

    $tutorId = filter_var($_GET['tutorId'], FILTER_SANITIZE_NUMBER_INT);
    if (!$tutorId) {
        throw new Exception('ID de tutor inválido');
    }

    // Primero, encontrar todos los alumnos que tienen a este tutor como único tutor
    $query = "SELECT a.id, a.nombre, a.apellido, 
              (SELECT COUNT(at2.idPadreTutor) 
               FROM alumnotutor at2 
               WHERE at2.idAlumno = a.id) as total_tutores 
              FROM alumno a 
              INNER JOIN alumnotutor at1 ON a.id = at1.idAlumno 
              WHERE at1.idPadreTutor = :tutorId
              HAVING total_tutores = 1";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute(['tutorId' => $tutorId]);
    
    $alumnosAfectados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    enviarJSON([
        'success' => true,
        'alumnosUnicos' => $alumnosAfectados
    ]);

} catch (PDOException $e) {
    enviarJSON([
        'success' => false,
        'error' => 'Error en la base de datos',
        'detalle' => $e->getMessage()
    ], 500);
} catch (Exception $e) {
    enviarJSON([
        'success' => false,
        'error' => $e->getMessage()
    ], 400);
} finally {
    // Limpiar cualquier salida almacenada en el buffer
    ob_end_clean();
}