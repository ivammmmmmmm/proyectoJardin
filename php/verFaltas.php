<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    $pdo = Conexion::conectar();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Unir registros de falta y presente para tener una fila por alumno+fecha
    $query = "
        SELECT
            a.id AS alumno_id,
            a.nombre AS alumno_nombre,
            a.apellido AS alumno_apellido,
            s.nombre AS sala_nombre,
            t.falta_id,
            t.fecha,
            t.razon_id,
            r.nombre AS razon,
            t.estado
        FROM (
            SELECT idAlumno AS alumno_id, idSala AS idSala, fecha AS fecha, id AS falta_id, idRazon AS razon_id, 'ausente' AS estado
            FROM falta
            UNION ALL
            SELECT idAlumno AS alumno_id, idSala AS idSala, fecha AS fecha, NULL AS falta_id, NULL AS razon_id, 'presente' AS estado
            FROM presente
        ) t
        JOIN alumno a ON t.alumno_id = a.id
        LEFT JOIN sala s ON t.idSala = s.id
        LEFT JOIN razon r ON t.razon_id = r.id
        ORDER BY t.fecha DESC, a.apellido, a.nombre
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => count($registros) > 0 ? 'Datos recuperados correctamente' : 'No se encontraron registros',
        'count' => count($registros),
        'data' => $registros
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos',
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

?>