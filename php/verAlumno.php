<?php
/**
 * Script unificado para obtener información de alumnos.
 * Proporciona diferentes niveles de detalle según los parámetros:
 * - simple=1: Devuelve solo id, nombre y apellido (para selectores)
 * - detail=1: Devuelve información completa incluyendo tutores
 * - ajax=1: Formato específico para respuestas AJAX
 */

header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 0);

/**
 * Calcula la edad de una persona a partir de su fecha de nacimiento.
 * 
 * @param string $fechaNacimiento Fecha de nacimiento en formato Y-m-d
 * @return int Edad calculada en años
 */
function calcularEdad($fechaNacimiento) {
    $hoy = new DateTime();
    $nacimiento = new DateTime($fechaNacimiento);
    $edad = $hoy->diff($nacimiento);
    return $edad->y;
}

try {
    // Iniciar logging
    error_log('[verAlumno.php] Iniciando script');
    error_log('[verAlumno.php] Parámetros recibidos: ' . print_r($_GET, true));

    require_once __DIR__ . '/conexion.php';
    error_log('[verAlumno.php] Conexion.php incluido');
    
    $pdo = Conexion::conectar();
    error_log('[verAlumno.php] Conexión establecida');

    // Determinar el tipo de consulta según los parámetros
    $isSimple = isset($_GET['simple']) && $_GET['simple'] == '1';
    $isDetailed = isset($_GET['detail']) && $_GET['detail'] == '1';
    $isAjax = isset($_GET['ajax']) && $_GET['ajax'] == '1';

    // Obtener el ID de la sala si se proporciona
    $idSala = isset($_GET['idSala']) ? filter_var($_GET['idSala'], FILTER_VALIDATE_INT) : null;

    // Seleccionar la consulta apropiada
    if ($isSimple) {
        if ($idSala) {
            // Consulta simple filtrada por sala
            $sql = "SELECT a.id, a.nombre, a.apellido, a.dni 
                   FROM alumno a 
                   WHERE a.idSala = ? 
                   ORDER BY a.apellido, a.nombre";
        } else {
            // Consulta simple para todos los alumnos
            $sql = "SELECT id, nombre, apellido, dni FROM alumno ORDER BY apellido, nombre";
        }
    } else {
        // Consulta completa con tutores, sala y estado
        $sql = "
            SELECT 
                a.id, 
                a.nombre, 
                a.apellido, 
                a.dni, 
                a.direccion, 
                a.fecha_nacimiento,
                a.idSala,
                s.nombre AS nombreSala,
                a.idEstado,
                e.nombre AS nombreEstado,
                GROUP_CONCAT(
                    CONCAT(pt.nombre, ' ', pt.apellido, ' (Tel: ', COALESCE(pt.telefono, 'No disponible'), ')')
                    SEPARATOR ', '
                ) AS tutores
            FROM 
                alumno a
            LEFT JOIN 
                alumnotutor at ON a.id = at.idAlumno
            LEFT JOIN 
                padretutor pt ON at.idPadreTutor = pt.id
            LEFT JOIN 
                sala s ON a.idSala = s.id
            LEFT JOIN 
                estado e ON a.idEstado = e.id
            " . ($idSala ? "WHERE a.idSala = ?" : "") . "
            GROUP BY 
                a.id, a.nombre, a.apellido, a.dni, a.direccion, a.fecha_nacimiento, a.idSala, s.nombre, a.idEstado, e.nombre
        ";
    }

    error_log('[verAlumno.php] SQL a ejecutar: ' . $sql);
    $stmt = $pdo->prepare($sql);
    error_log('[verAlumno.php] Consulta preparada');
    
    // Ejecutar la consulta con el parámetro de sala si existe
    if ($idSala) {
        error_log('[verAlumno.php] Ejecutando consulta con idSala: ' . $idSala);
        $stmt->execute([$idSala]);
    } else {
        error_log('[verAlumno.php] Ejecutando consulta sin parámetros');
        $stmt->execute();
    }
    
    $alumnos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log('[verAlumno.php] Alumnos recuperados: ' . count($alumnos));

    // Procesar los resultados si no es consulta simple
    if (!$isSimple) {
        foreach ($alumnos as &$alumno) {
            if (empty($alumno['tutores'])) {
                $alumno['tutores'] = 'Sin tutores asignados';
            }
            // Formatear fecha y calcular edad si existe
            if (!empty($alumno['fecha_nacimiento'])) {
                $fecha = new DateTime($alumno['fecha_nacimiento']);
                $alumno['edad'] = calcularEdad($alumno['fecha_nacimiento']);
                $alumno['fecha_nacimiento'] = $fecha->format('d/m/Y');
            }
        }
    }

    // Formatear la respuesta según el tipo de solicitud
    if ($isAjax) {
        echo json_encode($alumnos);
    } else {
        echo json_encode([
            'success' => true,
            'alumnos' => $alumnos
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en la base de datos',
        'debug' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
