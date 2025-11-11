<?php
// Asegurarnos de que no haya salida antes de los headers
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');

try {
    require_once 'conexion.php';

    // Obtener conexión PDO desde la clase Conexion
    $pdo = Conexion::conectar();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Consulta de tutores con manejo de errores
    $sql = "
        SELECT 
            pt.id, 
            pt.nombre, 
            pt.apellido, 
            pt.telefono, 
            pt.direccion, 
            pt.mail,
            COUNT(at.idAlumno) as alumnos_count,
            GROUP_CONCAT(CONCAT(a.nombre, ' ', a.apellido) SEPARATOR ', ') AS alumnos_a_cargo
        FROM 
            padretutor pt
        LEFT JOIN 
            alumnotutor at ON pt.id = at.idPadreTutor
        LEFT JOIN 
            alumno a ON at.idAlumno = a.id
        GROUP BY 
            pt.id, pt.nombre, pt.apellido, pt.telefono, pt.direccion, pt.mail
    ";
    
    $stmt = $pdo->prepare($sql);

    $stmt->execute();
    $tutores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Procesar los resultados
    foreach ($tutores as &$tutor) {
        // Si no hay alumnos, establecer un valor predeterminado
        if (empty($tutor['alumnos_a_cargo'])) {
            $tutor['alumnos_a_cargo'] = 'Ninguno';
        }
    }

    if (isset($_GET['ajax'])) {
        echo json_encode($tutores);
    } else {
        echo json_encode([
            'status' => 'success',
            'tutores' => $tutores
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
