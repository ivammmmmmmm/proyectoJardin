<?php
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    require_once __DIR__ . '/conexion.php';
    $pdo = Conexion::conectar();

    // Log para debugging
    error_log("[verDocentes.php] Iniciando consulta de docentes");

    // Consulta de docentes con sus salas asociadas
    $sql = "SELECT 
                d.id, 
                d.nombre, 
                d.apellido, 
                d.dni, 
                d.direccion, 
                d.telefono, 
                d.mail,
                GROUP_CONCAT(s.id SEPARATOR ',') AS idSalas,
                GROUP_CONCAT(s.nombre SEPARATOR ',') AS salasNombres
            FROM docente d
            LEFT JOIN sala s ON d.id = s.idDocente
            GROUP BY d.id, d.nombre, d.apellido, d.dni, d.direccion, d.telefono, d.mail
            ORDER BY d.apellido, d.nombre";
    
    $stmt = $pdo->prepare($sql);
    if (!$stmt) {
        throw new Exception('Error preparando la consulta');
    }

    if (!$stmt->execute()) {
        throw new Exception('Error ejecutando la consulta');
    }

    $docentes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    error_log("[verDocentes.php] Docentes recuperados: " . count($docentes));

    // Verificar que tenemos un array (incluso si está vacío)
    if (!is_array($docentes)) {
        throw new Exception('Error al recuperar los docentes');
    }

    // Para llamadas AJAX, devolver solo el array de docentes
    if (isset($_GET['ajax'])) {
        error_log("[verDocentes.php] Enviando respuesta AJAX");
        echo json_encode($docentes);
    } else {
        // Para llamadas normales, devolver estructura completa
        error_log("[verDocentes.php] Enviando respuesta normal");
        echo json_encode([
            'status' => 'success',
            'docentes' => $docentes
        ]);
    }

} catch (PDOException $e) {
    error_log("[verDocentes.php] Error PDO: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en la base de datos',
        'debug' => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("[verDocentes.php] Error general: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

// ...existing code...
?>
