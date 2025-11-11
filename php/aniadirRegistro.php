<?php
// Mostrar errores (solo durante desarrollo)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Respuesta en formato JSON
header('Content-Type: application/json; charset=utf-8');

try {
    // Incluir conexión a la base
    require_once 'conexion.php';

    // Verificar método
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido. Se requiere POST.');
    }

    // La conexión PDO ya lanzará una excepción si hay error
    if (!isset($pdo)) {
        throw new Exception('Error de conexión a la base de datos');
    }

    // Campos requeridos
    $required = ['idAlumno', 'idPadreTutor', 'idDocente', 'idSala', 'fecha', 'medioUtilizado', 'causa', 'desarrollo'];
    foreach ($required as $campo) {
        if (empty($_POST[$campo])) {
            throw new Exception("El campo '$campo' es obligatorio.");
        }
    }

    // Limpiar datos
    $idAlumno      = intval($_POST['idAlumno']);
    $idPadreTutor  = intval($_POST['idPadreTutor']);
    $idDocente     = intval($_POST['idDocente']);
    $idSala        = intval($_POST['idSala']);
    $fecha         = $_POST['fecha'];
    $medio         = trim($_POST['medioUtilizado']);
    $causa         = trim($_POST['causa']);
    $desarrollo    = trim($_POST['desarrollo']);

    // Validaciones de longitud (según tu SQL)
    if (strlen($causa) > 25) {
        throw new Exception("La causa no puede superar los 25 caracteres.");
    }
    if (strlen($desarrollo) > 25) {
        throw new Exception("El desarrollo no puede superar los 25 caracteres.");
    }

    // Preparar consulta
        // Preparar consulta con PDO
        $sql = "INSERT INTO comunicado 
            (idAlumno, idPadreTutor, idDocente, idSala, fecha, medioUtilizado, causa, desarrollo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $pdo->prepare($sql);
        if (!$stmt) {
            $err = $pdo->errorInfo();
            throw new Exception('Error al preparar la consulta: ' . implode(' | ', $err));
        }

        // Ejecutar con parámetros
        $ok = $stmt->execute([
            $idAlumno,
            $idPadreTutor,
            $idDocente,
            $idSala,
            $fecha,
            $medio,
            $causa,
            $desarrollo
        ]);

        if ($ok) {
            echo json_encode([
                'success' => true,
                'message' => 'Registro añadido correctamente.',
                'id' => $pdo->lastInsertId()
            ]);
        } else {
            $err = $stmt->errorInfo();
            throw new Exception('Error al ejecutar la consulta: ' . implode(' | ', $err));
        }

} catch (Throwable $e) {
    // Capturar errores y devolver JSON legible
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_details' => [
            'line' => $e->getLine(),
            'file' => basename($e->getFile())
        ]
    ]);
}
