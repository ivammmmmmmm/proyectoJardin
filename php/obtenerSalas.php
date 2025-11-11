<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

error_log('[obtenerSalas.php] Iniciando script');

try {
    require_once __DIR__ . '/conexion.php';
    $pdo = Conexion::conectar();

    $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'todas';
    $idDocente = isset($_GET['idDocente']) ? $_GET['idDocente'] : null;
    $params = [];

    // Seleccionar la consulta según el tipo
    switch ($tipo) {
        case 'disponibles':
            $query = "
                SELECT s.id, s.nombre, t.nombre AS turno
                FROM sala s
                INNER JOIN turno t ON s.idTurno = t.id
                WHERE s.idDocente IS NULL
                ORDER BY s.nombre
            ";
            break;

        case 'docente':
            if (!$idDocente) {
                throw new Exception('ID de docente no proporcionado');
            }
            $query = "
                SELECT s.id, s.nombre, t.nombre AS turno
                FROM sala s
                INNER JOIN turno t ON s.idTurno = t.id
                WHERE s.idDocente = :idDocente
                ORDER BY s.nombre
            ";
            $params['idDocente'] = $idDocente;
            break;

        case 'con_docentes':
            $query = "
                SELECT 
                    s.id, s.nombre, 
                    t.nombre AS turno_nombre,
                    COALESCE(d.nombre, '') AS docente_nombre,
                    COALESCE(d.apellido, '') AS docente_apellido,
                    d.id AS docente_asignado_id
                FROM sala s
                INNER JOIN turno t ON s.idTurno = t.id
                LEFT JOIN docente d ON s.idDocente = d.id
                ORDER BY s.nombre
            ";
            break;

        default: // 'todas'
            $query = "
                SELECT s.id, s.nombre, t.nombre AS turno
                FROM sala s
                INNER JOIN turno t ON s.idTurno = t.id
                ORDER BY s.nombre
            ";
    }

    // Preparar y ejecutar la consulta
    $stmt = $pdo->prepare($query);
    if (!$stmt) {
        throw new Exception('Error preparando la consulta: ' . print_r($pdo->errorInfo(), true));
    }

    $stmt->execute($params);
    $salas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    error_log("[obtenerSalas.php] Salas recuperadas: " . count($salas));

    echo json_encode([
        'status' => 'success',
        'salas' => $salas
    ]);

} catch (Exception $e) {
    error_log('[obtenerSalas.php] ERROR: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al obtener las salas',
        'debug' => $e->getMessage()
    ]);
}
