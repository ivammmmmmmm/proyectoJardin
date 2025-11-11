<?php
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

require_once 'db_logger.php';
logError('obtenerDatos.php', 'Iniciando obtenerDatos.php');

try {
    require_once 'conexion.php';
    
    try {
        $pdo = Conexion::conectar();
        logError('obtenerDatos.php', 'Conexión PDO establecida correctamente');
    } catch (PDOException $e) {
        error_log("Error de conexión PDO: " . $e->getMessage());
        throw new Exception("Error de conexión a la base de datos: " . $e->getMessage());
    }

    $tipo = $_GET['tipo'] ?? '';
    if (empty($tipo)) {
        throw new Exception('Tipo de datos no especificado');
    }

    logError('obtenerDatos.php', "Obteniendo datos de tipo: " . $tipo);
    
    $query = '';
    switch($tipo) {
        case 'asistencia':
            if (!isset($_GET['alumnoId']) || !isset($_GET['fecha'])) {
                throw new Exception('Se requieren alumnoId y fecha');
            }
            
            $alumnoId = $_GET['alumnoId'];
            $fecha = $_GET['fecha'];
            
            logError('obtenerDatos.php', "Preparando consulta para alumnoId: $alumnoId y fecha: $fecha");
            
            // Consulta para obtener información de asistencia
            $query = "SELECT 
                a.id as alumno_id,
                a.nombre as alumno_nombre,
                a.apellido as alumno_apellido,
                s.id as sala_id,
                s.nombre as sala_nombre,
                f.id as falta_id,
                COALESCE(f.fecha, p.fecha) as fecha,
                f.idRazon as razon_id,
                r.nombre as razon,
                p.id as presente_id,
                CASE 
                    WHEN p.id IS NOT NULL THEN 'presente'
                    WHEN f.id IS NOT NULL THEN 'ausente'
                    ELSE 'sin_registro'
                END as estado
            FROM alumno a
            LEFT JOIN sala s ON a.idSala = s.id
            LEFT JOIN (
                SELECT * FROM falta WHERE DATE(fecha) = :fecha_falta AND idAlumno = :alumno_id_falta
            ) f ON f.idAlumno = a.id
            LEFT JOIN (
                SELECT * FROM presente WHERE DATE(fecha) = :fecha_presente AND idAlumno = :alumno_id_presente
            ) p ON p.idAlumno = a.id
            LEFT JOIN razon r ON f.idRazon = r.id
            WHERE a.id = :alumno_id_main";

            $stmt = $pdo->prepare($query);
            logError('obtenerDatos.php', "Ejecutando consulta con alumnoId: $alumnoId y fecha: $fecha");
            
            $params = [
                ':fecha_falta' => $fecha,
                ':alumno_id_falta' => $alumnoId,
                ':fecha_presente' => $fecha,
                ':alumno_id_presente' => $alumnoId,
                ':alumno_id_main' => $alumnoId
            ];
            logError('obtenerDatos.php', "Parámetros: " . json_encode($params));
            
            $stmt->execute($params);
            
            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$resultado) {
                logError('obtenerDatos.php', "No se encontró registro, buscando datos básicos del alumno");
                
                // Si no hay registro, devolvemos un objeto con los datos básicos
                $queryAlumno = "SELECT 
                    a.id as alumno_id,
                    a.nombre as alumno_nombre,
                    a.apellido as alumno_apellido,
                    s.id as sala_id,
                    s.nombre as sala_nombre
                FROM alumno a
                LEFT JOIN sala s ON a.idSala = s.id
                WHERE a.id = :alumnoId";
                
                $stmtAlumno = $pdo->prepare($queryAlumno);
                $stmtAlumno->execute([':alumnoId' => $alumnoId]);
                $alumnoData = $stmtAlumno->fetch(PDO::FETCH_ASSOC);
                
                if (!$alumnoData) {
                    logError('obtenerDatos.php', "No se encontró el alumno con ID: $alumnoId");
                    throw new Exception("No se encontró el alumno con ID: $alumnoId");
                }
                
                $resultado = array_merge($alumnoData, [
                    'falta_id' => null,
                    'fecha' => $fecha,
                    'razon_id' => null,
                    'razon' => null,
                    'presente_id' => null,
                    'estado' => 'sin_registro'
                ]);
            }
            
            echo json_encode([
                'success' => true,
                'data' => $resultado
            ]);
            exit;

        case 'falta':
            if (!isset($_GET['id'])) {
                throw new Exception('ID de falta no proporcionado');
            }
            $id = $_GET['id'];
            logError('obtenerDatos.php', "Buscando falta con ID: " . $id);
            
            // Primero verificamos si la falta existe
            $checkQuery = "SELECT COUNT(*) FROM falta WHERE id = :id";
            $checkStmt = $pdo->prepare($checkQuery);
            $checkStmt->bindParam(':id', $id, PDO::PARAM_INT);
            $checkStmt->execute();
            $count = $checkStmt->fetchColumn();
            
            if ($count == 0) {
                logError('obtenerDatos.php', "No se encontró la falta con ID: " . $id);
                throw new Exception("No se encontró la falta especificada");
            }
            
            logError('obtenerDatos.php', "Falta encontrada, procediendo con la consulta completa");
            // Si la falta existe, procedemos con la consulta completa
            $query = "SELECT 
                f.id, 
                f.fecha, 
                f.idRazon as razon_id,
                r.nombre as razon,
                f.idAlumno as alumno_id,
                CONCAT(a.apellido, ', ', a.nombre) as alumno_nombre,
                f.idSala as sala_id,
                s.nombre as sala_nombre
            FROM falta f
            LEFT JOIN alumno a ON f.idAlumno = a.id
            LEFT JOIN sala s ON f.idSala = s.id
            LEFT JOIN razon r ON f.idRazon = r.id
            WHERE f.id = :id";
            
            error_log("Ejecutando consulta: " . $query);
            try {
                $stmt = $pdo->prepare($query);
                $stmt->bindParam(':id', $id, PDO::PARAM_INT);
                $stmt->execute();
                $falta = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$falta) {
                    logError('obtenerDatos.php', "No se encontraron datos para la falta ID: $id");
                    throw new Exception("No se encontraron datos para la falta");
                }
                
                logError('obtenerDatos.php', "Datos encontrados para la falta: " . json_encode($falta));
                echo json_encode($falta);
                exit;
            } catch (PDOException $e) {
                logError('obtenerDatos.php', "Error en la consulta SQL: " . $e->getMessage());
                throw $e;
            }
        case 'alumnos':
            $query = "SELECT id, nombre, apellido FROM alumno ORDER BY nombre, apellido";
            break;
        case 'tutores':
            $query = "SELECT id, nombre, apellido FROM padretutor WHERE nombre IS NOT NULL ORDER BY nombre, apellido";
            break;
        case 'docentes':
            $query = "SELECT id, nombre, apellido FROM docente ORDER BY nombre, apellido";
            break;
        case 'salas':
            $query = "SELECT id, nombre FROM sala ORDER BY nombre";
            break;
        default:
            throw new Exception("Tipo de datos no válido: " . $tipo);
    }
    
    $stmt = $pdo->prepare($query);
    if (!$stmt->execute()) {
        throw new Exception("Error ejecutando la consulta");
    }
    
    $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    logError('obtenerDatos.php', "Datos obtenidos de la consulta: " . json_encode($datos));
    
    if (empty($datos)) {
        logError('obtenerDatos.php', "No se encontraron datos para el tipo: $tipo");
        echo json_encode([]);
        exit;
    }

    // Formatear los datos según el tipo
    $resultados = array_map(function($fila) use ($tipo) {
        $id = (int)$fila['id'];
        
        switch ($tipo) {
            case 'salas':
                return [
                    'id' => $id,
                    'nombre' => $fila['nombre']
                ];
            case 'alumnos':
            case 'tutores':
            case 'docentes':
                return [
                    'id' => $id,
                    'nombre' => $fila['nombre'],
                    'apellido' => $fila['apellido']
                ];
            default:
                return $fila;
        }
    }, $datos);
    
    error_log("[obtenerDatos.php] Datos obtenidos: " . count($resultados));
    echo json_encode($resultados);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
?>