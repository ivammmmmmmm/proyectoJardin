<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

error_log('[obtenerSalasConTurnos.php] Iniciando script');

try {
    require_once __DIR__ . '/conexion.php';

    $pdo = Conexion::conectar();
    error_log('[obtenerSalasConTurnos.php] Conexión establecida correctamente');

    // Consulta para obtener todas las salas con sus turnos
    $query = "SELECT s.id, s.nombre, s.idTurno, t.nombre as turno 
              FROM sala s 
              JOIN turno t ON s.idTurno = t.id 
              ORDER BY s.nombre";
    
    $stmt = $pdo->prepare($query);
    if (!$stmt) {
        throw new Exception('Error preparando la consulta');
    }

    if (!$stmt->execute()) {
        throw new Exception('Error ejecutando la consulta');
    }

    $salas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    error_log('[obtenerSalasConTurnos.php] Salas recuperadas: ' . count($salas));

    echo json_encode($salas);

} catch (Exception $e) {
    error_log('[obtenerSalasConTurnos.php] ERROR: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al obtener las salas',
        'debug' => $e->getMessage()
    ]);
}