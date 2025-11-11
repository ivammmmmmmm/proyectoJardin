<?php
// Desactivar la visualización de errores en la salida para no romper el JSON
ini_set('display_errors', 0);
// Reportar todos los errores a los logs
error_reporting(E_ALL);

// Establecer la cabecera a JSON desde el principio
header('Content-Type: application/json; charset=utf-8');

try {
    // Incluir el archivo de conexión
    require_once 'conexion.php';
    $pdo = Conexion::conectar();

    // Query base simplificada para asegurar que los joins funcionan
    $baseQuery = "
        SELECT 
            c.id, 
            c.fecha, 
            c.medioUtilizado, 
            c.causa,
            c.desarrollo,
            c.idAlumno as alumno_id,
            c.idPadreTutor as tutor_id,
            c.idDocente as docente_id,
            c.idSala as sala_id,
            CONCAT(a.nombre, ' ', a.apellido) as alumno_nombre,
            CONCAT(p.nombre, ' ', p.apellido) as tutor_nombre,
            CONCAT(d.nombre, ' ', d.apellido) as docente_nombre,
            s.nombre as sala_nombre
        FROM comunicado c
        LEFT JOIN alumno a ON c.idAlumno = a.id
        LEFT JOIN padretutor p ON c.idPadreTutor = p.id
        LEFT JOIN docente d ON c.idDocente = d.id
        LEFT JOIN sala s ON c.idSala = s.id
        ORDER BY c.fecha DESC
    ";

    if (isset($_GET['id'])) {
        // Si se proporciona un ID, obtener un registro específico
        $id = (int)$_GET['id'];
        $query = $baseQuery . " WHERE c.id = ? ORDER BY c.fecha DESC";
        $stmt = $pdo->prepare($query);
        if (!$stmt) throw new Exception("Error preparando la consulta para un solo ID.");
        $stmt->execute([$id]);
        $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        // Obtener todos los registros
        $stmt = $pdo->query($baseQuery);
        if (!$stmt) throw new Exception("Error ejecutando la consulta general.");
        $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Procesar los resultados
    $registros = [];
    foreach ($resultado as $registro) {
        $registros[] = [
            'id' => (int)($registro['id'] ?? 0),
            'fecha' => $registro['fecha'] ?? null,
            'medioUtilizado' => $registro['medioUtilizado'] ?? '',
            'causa' => $registro['causa'] ?? '',
            'alumno_nombre' => $registro['alumno_nombre'] ?? 'N/A',
            'tutor_nombre' => $registro['tutor_nombre'] ?? 'N/A',
            'docente_nombre' => $registro['docente_nombre'] ?? 'N/A',
            'sala_nombre' => $registro['sala_nombre'] ?? 'N/A',
            'desarrollo' => $registro['desarrollo'] ?? ''
        ];
    }
    
    // Asegurar que enviamos JSON válido
    if (json_encode($registros) === false) {
        throw new Exception("Error codificando JSON: " . json_last_error_msg());
    }
    
    echo json_encode($registros);

} catch (Exception $e) {
    // Log el error real para debugging
    // Asegurarse de que el servidor web tenga permisos para escribir en este archivo
    error_log("Error en verRegistros.php: " . $e->getMessage(), 3, "C:/xampp/php/logs/php_error.log");
    
    // Devolver un error amigable como JSON
    // Si los headers ya se enviaron, esto podría fallar, pero lo intentamos.
    if (!headers_sent()) {
        http_response_code(500);
    }
    echo json_encode([
        "error" => true,
        "message" => "Error interno del servidor al obtener registros.",
        "debug" => $e->getMessage() // Proporciona el mensaje de error para depuración
    ]);
} finally {
    // Asegurarse de que la conexión se cierre si está abierta
    // No es necesario cerrar PDO explícitamente; dejamos la limpieza al GC
}
?>