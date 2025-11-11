<?php
ob_start();

// Función de salida JSON
function enviarRespuesta($data) {
    if (ob_get_length()) ob_clean();
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: *');
    
    $json = json_encode($data, JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        http_response_code(500);
        $error = json_last_error_msg();
        echo json_encode([
            'status' => 'error',
            'message' => 'Error al codificar JSON',
            'debug' => $error
        ]);
    } else {
        echo $json;
    }
    
    ob_end_flush();
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

try {
    require_once __DIR__ . '/conexion.php';
    
    // Establecer la conexión usando la clase Conexion
    try {
        $pdo = Conexion::conectar();
    } catch (PDOException $e) {
        throw new Exception('Error al conectar con la base de datos: ' . $e->getMessage());
    }

    // Parámetros
    $mes = isset($_GET['mes']) ? (int)$_GET['mes'] : date('m');
    $anio = isset($_GET['anio']) ? (int)$_GET['anio'] : date('Y');
    $sala_id = !empty($_GET['sala']) ? (int)$_GET['sala'] : null;

    if ($mes < 1 || $mes > 12) throw new Exception("Mes inválido: $mes");
    if ($anio < 1000 || $anio > 2100) throw new Exception("Año inválido: $anio");
    if ($sala_id !== null && $sala_id <= 0) throw new Exception("ID de sala inválido");

    error_log("[estadisticasSalas.php] Generando estadísticas mes=$mes año=$anio sala=$sala_id");

    // Consulta SQL
    $query = "
        SELECT 
            s.id AS sala_id,
            s.nombre AS sala_nombre,
            COUNT(c.id) AS total_comunicados,
            COUNT(DISTINCT c.idAlumno) AS alumnos_con_comunicados,
            t.nombre AS turno
        FROM sala s
        LEFT JOIN comunicado c ON s.id = c.idSala 
            AND MONTH(c.fecha) = ?
            AND YEAR(c.fecha) = ?
        LEFT JOIN turno t ON s.idTurno = t.id
    ";

    if ($sala_id) $query .= "WHERE s.id = ? ";

    $query .= "GROUP BY s.id, s.nombre, t.nombre ORDER BY s.id";

    $stmt = $pdo->prepare($query);
    $params = [$mes, $anio];
    if ($sala_id) $params[] = $sala_id;

    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Procesar resultados
    $labels = [];
    $comunicados = [];
    $alumnos = [];
    $datos = [];

    foreach ($rows as $row) {
        $labels[] = "Sala " . $row['sala_nombre'] . " (" . $row['turno'] . ")";
        $comunicados[] = (int)$row['total_comunicados'];
        $alumnos[] = (int)$row['alumnos_con_comunicados'];
        $datos[] = [
            'id' => (int)$row['sala_id'],
            'nombre' => $row['sala_nombre'],
            'turno' => $row['turno'],
            'total_comunicados' => (int)$row['total_comunicados'],
            'alumnos_con_comunicados' => (int)$row['alumnos_con_comunicados']
        ];
    }

    // Datos del gráfico
    $graficoData = [
        'labels' => $labels,
        'datasets' => [
            [
                'label' => 'Total Comunicados',
                'data' => $comunicados,
                'backgroundColor' => 'rgba(54, 162, 235, 0.5)',
                'borderColor' => 'rgba(54, 162, 235, 1)',
                'borderWidth' => 1
            ],
            [
                'label' => 'Alumnos con Comunicados',
                'data' => $alumnos,
                'backgroundColor' => 'rgba(255, 99, 132, 0.5)',
                'borderColor' => 'rgba(255, 99, 132, 1)',
                'borderWidth' => 1
            ]
        ]
    ];

    enviarRespuesta([
        'status' => 'success',
        'datos' => $datos,
        'grafico' => $graficoData
    ]);

} catch (Exception $e) {
    http_response_code(500);
    enviarRespuesta([
        'status' => 'error',
        'message' => 'Error al generar estadísticas',
        'debug' => [
            'msg' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
}
