<?php
// Asegurarnos de que no haya salida antes del JSON
if (ob_get_level()) ob_end_clean();

// Configurar cabeceras
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

// Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

try {
    // Verificar que conexion.php existe
    if (!file_exists(__DIR__ . '/conexion.php')) {
        throw new Exception('Archivo de conexión no encontrado: ' . __DIR__ . '/conexion.php');
    }

    // Conexión a la base de datos
    require_once __DIR__ . '/conexion.php';
    try {
        $pdo = Conexion::conectar();
    } catch (PDOException $e) {
        throw new Exception('Error al conectar con la base de datos: ' . $e->getMessage());
    }

    // Obtener parámetros de la solicitud
    $fechaInicio = isset($_GET['fechaInicio']) ? $_GET['fechaInicio'] : date('Y-m-01');
    $fechaFin = isset($_GET['fechaFin']) ? $_GET['fechaFin'] : date('Y-m-d');
    $salaId = isset($_GET['salaId']) ? intval($_GET['salaId']) : null;

    // Estadísticas generales
    $queryStats = "SELECT 
        COUNT(*) as total_faltas,
        COUNT(DISTINCT idAlumno) as alumnos_con_faltas
    FROM falta f
    WHERE f.fecha >= :fechaInicio AND f.fecha <= :fechaFin";
    
    if ($salaId) {
        $queryStats .= " AND f.idSala = :salaId";
    }
    
    $stmtStats = $pdo->prepare($queryStats);
    $stmtStats->bindValue(':fechaInicio', $fechaInicio);
    $stmtStats->bindValue(':fechaFin', $fechaFin);
    if ($salaId) {
        $stmtStats->bindValue(':salaId', $salaId);
    }
    
    $stmtStats->execute();
    $stats = $stmtStats->fetch(PDO::FETCH_ASSOC);

    // Preparar los parámetros para las consultas
    $params = [
        ':fechaInicio' => $fechaInicio,
        ':fechaFin' => $fechaFin
    ];
    
    if ($salaId) {
        $params[':salaId'] = $salaId;
    }

    // Base de la condición WHERE para todas las consultas
    $whereClause = "WHERE f.fecha >= :fechaInicio AND f.fecha <= :fechaFin";
    if ($salaId) {
        $whereClause .= " AND f.idSala = :salaId";
    }

    // Consulta para faltas por razón
    $queryRazones = "SELECT 
                        COALESCE(r.nombre, 'Sin razón especificada') as nombre, 
                        COUNT(*) as total
                     FROM falta f
                     LEFT JOIN razon r ON f.idRazon = r.id
                     $whereClause
                     GROUP BY r.id, r.nombre
                     ORDER BY total DESC";

    // Consulta para faltas por sala
    $querySalas = "SELECT s.nombre, COUNT(*) as total
                   FROM falta f
                   INNER JOIN sala s ON f.idSala = s.id
                   $whereClause
                   GROUP BY s.id, s.nombre
                   ORDER BY total DESC";

    // Consulta para tendencia mensual
    $queryTendencia = "SELECT 
                        DATE_FORMAT(f.fecha, '%Y-%m') as mes,
                        COUNT(*) as total
                      FROM falta f
                      $whereClause
                      GROUP BY DATE_FORMAT(f.fecha, '%Y-%m')
                      ORDER BY mes ASC";

    // Ejecutar consultas
    $stmtRazones = $pdo->prepare($queryRazones);
    $stmtSalas = $pdo->prepare($querySalas);
    $stmtTendencia = $pdo->prepare($queryTendencia);

    // Bind parameters para cada consulta
    foreach ($params as $key => $value) {
        $stmtRazones->bindValue($key, $value);
        $stmtSalas->bindValue($key, $value);
        $stmtTendencia->bindValue($key, $value);
    }

    try {
        $stmtRazones->execute();
        $stmtSalas->execute();
        $stmtTendencia->execute();

        // Combinar todos los resultados en un solo objeto
        $result = [
            'stats' => $stats,
            'razones' => $stmtRazones->fetchAll(PDO::FETCH_ASSOC),
            'salas' => $stmtSalas->fetchAll(PDO::FETCH_ASSOC),
            'tendencia' => $stmtTendencia->fetchAll(PDO::FETCH_ASSOC),
            'parametros' => [
                'fechaInicio' => $fechaInicio,
                'fechaFin' => $fechaFin,
                'salaId' => $salaId
            ]
        ];

        // Limpiar cualquier salida anterior
        if (ob_get_length()) ob_clean();
        
        // Asegurarnos de que el JSON se codifique correctamente
        $json = json_encode($result, JSON_UNESCAPED_UNICODE);
        if ($json === false) {
            throw new Exception('Error al codificar JSON: ' . json_last_error_msg());
        }
        
        echo $json;
    } catch (PDOException $e) {
        throw new Exception('Error al ejecutar las consultas: ' . $e->getMessage());
    }

} catch (Exception $e) {
    // Limpiar cualquier salida anterior
    if (ob_get_length()) ob_clean();
    
    // Registrar el error
    error_log("Error en estadisticasFaltas.php: " . $e->getMessage());
    
    // Establecer código de respuesta
    http_response_code(500);
    
    // Enviar respuesta de error
    $errorResponse = [
        'error' => true,
        'message' => 'Error al obtener estadísticas',
        'debug' => $e->getMessage()
    ];
    
    echo json_encode($errorResponse, JSON_UNESCAPED_UNICODE);
}
?>