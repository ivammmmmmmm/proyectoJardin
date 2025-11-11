<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

// Aceptar id por POST o GET
$idRaw = $_POST['id'] ?? $_GET['id'] ?? null;
$forceRaw = $_POST['force'] ?? $_GET['force'] ?? null; // '1' o 'true' para forzar
$force = ($forceRaw === '1' || strtolower((string)$forceRaw) === 'true');

if ($idRaw === null || !ctype_digit((string)$idRaw)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de tutor inválido.']);
    exit;
}

$id = (int) $idRaw;

// Usar transacción
try {
    $pdo->beginTransaction();

    // Verificar si el tutor está asociado a algún alumno
    $stmt_check = $pdo->prepare("SELECT COUNT(*) as cnt FROM alumnotutor WHERE idPadreTutor = ?");
    if (!$stmt_check) throw new Exception('Error preparando comprobación');
    $stmt_check->execute([$id]);
    $row = $stmt_check->fetch();
    $count = $row ? (int)$row['cnt'] : 0;

    $students = [];
    if ($count > 0) {
        // obtener lista de alumnos enlazados y si se quedarían sin tutores
        $stmt_students = $pdo->prepare("SELECT a.id, CONCAT(a.nombre, ' ', a.apellido) AS nombre, (SELECT COUNT(*) FROM alumnotutor at2 WHERE at2.idAlumno = a.id) AS tutor_count FROM alumnotutor at JOIN alumno a ON at.idAlumno = a.id WHERE at.idPadreTutor = ?");
        if ($stmt_students) {
            $stmt_students->execute([$id]);
            $res = $stmt_students->fetchAll(PDO::FETCH_ASSOC);
            foreach ($res as $r) {
                $students[] = [
                    'id' => (int)$r['id'],
                    'nombre' => $r['nombre'],
                    'tutor_count' => (int)$r['tutor_count'],
                    'willBeOrphan' => ((int)$r['tutor_count'] <= 1)
                ];
            }
        }

        if (!$force) {
            // No eliminar, informar al cliente que hay enlaces y pedir confirmación
            $pdo->rollBack();
            echo json_encode([
                'success' => false,
                'needConfirm' => true,
                'linkedCount' => $count,
                'linkedStudents' => $students,
                'message' => "El tutor está asociado a $count alumno(s). Confirme si desea eliminarlo y todos los vínculos."
            ]);
            exit;
        }
        // Si se forzó, calculamos qué alumnos quedarán sin tutores (aquellos con tutor_count <=1)
        $wouldBeOrphan = array_filter($students, function($s){ return $s['willBeOrphan']; });
    }

    // Si hay enlaces y se forzó, borrar vínculos primero
    $removedLinks = 0;
    if ($count > 0 && $force) {
        $del_links = $pdo->prepare("DELETE FROM alumnotutor WHERE idPadreTutor = ?");
        if (!$del_links) throw new Exception('Error preparando delete links');
        if (!$del_links->execute([$id])) {
            $err = $del_links->errorInfo();
            throw new Exception('Error borrando enlaces alumnotutor: ' . implode(' | ', $err));
        }
        $removedLinks = $del_links->rowCount();
    }

    // Eliminar tutor
    $stmt = $pdo->prepare("DELETE FROM padretutor WHERE id = ?");
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta');
    }
    if (!$stmt->execute([$id])) {
        $err = $stmt->errorInfo();
        throw new Exception('Error al ejecutar DELETE tutor: ' . implode(' | ', $err));
    }

    $affected = $stmt->rowCount();

    if ($affected === 0) {
        // No se eliminó nada: tutor no encontrado
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Tutor no encontrado.']);
        exit;
    }

    $pdo->commit();
    $response = ['success' => true, 'message' => 'Tutor eliminado correctamente.', 'removedLinks' => $removedLinks];
    // Si hubo alumnos que se quedarán sin tutores, incluirlos en la respuesta
    if (!empty($wouldBeOrphan)) {
        // devolver sólo id y nombre para la UI
        $orphaned = array_map(function($s){ return ['id' => $s['id'], 'nombre' => $s['nombre']]; }, $wouldBeOrphan);
        $response['orphanedStudents'] = $orphaned;
    }
    echo json_encode($response);
    exit;

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    error_log('eliminarTutor.php error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}
?>