<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

error_log('obtenerTutores.php iniciando');

try {
    require_once __DIR__ . '/conexion.php';

    // Obtener la conexión PDO usando la clase Conexion
    $pdo = Conexion::conectar();
    if (!$pdo) {
        error_log('obtenerTutores.php: no se pudo obtener PDO desde Conexion::conectar()');
        throw new Exception('Error: conexión PDO no disponible');
    }

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    error_log('obtenerTutores.php: conexión PDO OK');

    // Consulta para obtener todos los tutores ordenados por apellido y nombre
    $query = "SELECT id, apellido, nombre 
              FROM padretutor 
              ORDER BY apellido, nombre";

    error_log('obtenerTutores.php: Preparando query: ' . $query);
    
    $stmt = $pdo->prepare($query);
    if (!$stmt) {
        $error = $pdo->errorInfo();
        error_log('obtenerTutores.php: Error preparando consulta: ' . json_encode($error));
        throw new Exception('Error preparando consulta: ' . json_encode($error));
    }
    
    error_log('obtenerTutores.php: Ejecutando consulta');
    if (!$stmt->execute()) {
        $error = $stmt->errorInfo();
        error_log('obtenerTutores.php: Error ejecutando consulta: ' . json_encode($error));
        throw new Exception('Error ejecutando consulta: ' . json_encode($error));
    }
    
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    error_log('obtenerTutores.php rows: ' . count($rows));
    
    $tutores = array_map(function($row){
        return [
            'id' => isset($row['id']) ? (int)$row['id'] : null,
            'nombre' => $row['nombre'] ?? '',
            'apellido' => $row['apellido'] ?? ''
        ];
    }, $rows ?: []);
    
    $response = [
        'status' => 'success',
        'tutores' => $tutores
    ];
    
    error_log('obtenerTutores.php response: ' . json_encode($response));
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al obtener los tutores',
        'debug' => $e->getMessage()
    ]);
}