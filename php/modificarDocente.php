<?php
header('Content-Type: application/json');
require_once 'conexion.php';

try {
    $pdo = Conexion::conectar();
    if (!isset($_POST['id']) || !isset($_POST['nombre']) || !isset($_POST['apellido']) || 
        !isset($_POST['dni']) || !isset($_POST['telefono']) || !isset($_POST['direccion']) || !isset($_POST['mail'])) {
        throw new Exception('Faltan datos requeridos');
    }

    $id = $_POST['id'];
    $nombre = $_POST['nombre'];
    $apellido = $_POST['apellido'];
    $dni = $_POST['dni']; 
    $telefono = $_POST['telefono'];
    $direccion = $_POST['direccion'];
    $mail = $_POST['mail'];

    $sql = "UPDATE docente SET nombre = :nombre, apellido = :apellido, dni = :dni, telefono = :telefono, direccion = :direccion, mail = :mail WHERE id = :id";
    
    $stmt = $pdo->prepare($sql);
    
    $params = array(
        ':id' => $id,
        ':nombre' => $nombre,
        ':apellido' => $apellido,
        ':dni' => $dni,
        ':telefono' => $telefono,
        ':direccion' => $direccion,
        ':mail' => $mail
    );

    error_log("ModificarDocente - Actualizando docente con ID: " . $id);
    error_log("ModificarDocente - Parámetros: " . print_r($params, true));
    
    $stmt->execute($params);
    
    // Actualizar las salas asignadas
    if (isset($_POST['salas'])) {
        $salas = json_decode($_POST['salas'], true);
        
        // Validar que no haya salas del mismo turno
        if (count($salas) > 0) {
            $sql = "SELECT COUNT(*) as count FROM sala s1 
                    INNER JOIN sala s2 ON s1.idTurno = s2.idTurno 
                    WHERE s1.id IN (" . implode(',', $salas) . ") 
                    AND s2.id IN (" . implode(',', $salas) . ") 
                    AND s1.id < s2.id";
            $stmt = $pdo->query($sql);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($result['count'] > 0) {
                throw new Exception('No se pueden asignar salas del mismo turno');
            }
        }
        
        // Primero liberar las salas asignadas actualmente al docente
        $stmt = $pdo->prepare("UPDATE sala SET idDocente = NULL WHERE idDocente = ?");
        $stmt->execute([$id]);
        
        // Asignar las nuevas salas al docente
        if (count($salas) > 0) {
            $stmt = $pdo->prepare("UPDATE sala SET idDocente = ? WHERE id = ?");
            foreach ($salas as $idSala) {
                $result = $stmt->execute([$id, $idSala]);
                if (!$result) {
                    throw new Exception('Error al asignar la sala ' . $idSala);
                }
            }
        }
    }

    // Verificar si el docente existe antes de considerarlo un error
    $stmtCheck = $pdo->prepare("SELECT id FROM docente WHERE id = ?");
    $stmtCheck->execute([$id]);
    
    if ($stmtCheck->fetch()) {
        // El docente existe, la actualización fue exitosa (incluso si no hubo cambios)
        echo json_encode([
            'success' => true, 
            'message' => 'Docente actualizado correctamente',
            'debug' => [
                'rowsAffected' => $stmt->rowCount(),
                'id' => $id
            ]
        ]);
    } else {
        // El docente no existe
        error_log("ModificarDocente - No se encontró el docente. ID: " . $id);
        echo json_encode([
            'success' => false, 
            'message' => 'No se encontró el docente',
            'debug' => [
                'id' => $id
            ]
        ]);
    }

} catch (Exception $e) {
    error_log("ModificarDocente - Error: " . $e->getMessage());
    error_log("ModificarDocente - Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error al modificar el docente: ' . $e->getMessage(),
        'debug' => [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]
    ]);
}
?>