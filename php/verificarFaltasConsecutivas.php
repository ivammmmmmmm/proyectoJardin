<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexion.php';

try {
    $pdo = Conexion::conectar();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $idAlumno = isset($_GET['idAlumno']) ? intval($_GET['idAlumno']) : 0;
    
    if ($idAlumno <= 0) {
        throw new Exception('ID de alumno inválido');
    }
    
    // Obtener faltas injustificadas (idRazon = 2) de la última semana del alumno
    $semanaPasada = date('Y-m-d', strtotime('-7 days'));
    $hoy = date('Y-m-d');
    
    $query = "SELECT fecha FROM falta 
              WHERE idAlumno = ? 
              AND idRazon = 2
              AND fecha BETWEEN ? AND ? 
              ORDER BY fecha DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$idAlumno, $semanaPasada, $hoy]);
    $faltas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Contar faltas consecutivas
    $faltasConsecutivas = 0;
    $maxFaltasConsecutivas = 0;
    
    // Las fechas vienen ordenadas descendentemente, así que las procesamos en orden inverso (más antiguas primero)
    $fechasFaltas = array_reverse(array_column($faltas, 'fecha'));
    
    if (count($fechasFaltas) > 0) {
        $faltasConsecutivas = 1;
        
        for ($i = 1; $i < count($fechasFaltas); $i++) {
            $fechaActual = new DateTime($fechasFaltas[$i]);
            $fechaAnterior = new DateTime($fechasFaltas[$i - 1]);
            
            // Calcular diferencia en días
            $intervalo = $fechaActual->diff($fechaAnterior);
            
            // Si la diferencia es exactamente 1 día, es consecutiva
            if ($intervalo->days === 1) {
                $faltasConsecutivas++;
            } else {
                // Hay un salto, guardar máximo y reiniciar
                $maxFaltasConsecutivas = max($maxFaltasConsecutivas, $faltasConsecutivas);
                $faltasConsecutivas = 1;
            }
        }
        
        // Guardar el último conteo
        $maxFaltasConsecutivas = max($maxFaltasConsecutivas, $faltasConsecutivas);
    }
    
    $mensaje = '';
    if ($maxFaltasConsecutivas >= 3) {
        $mensaje = '⚠️ ' . $maxFaltasConsecutivas . ' faltas seguidas';
    }
    
    echo json_encode([
        'success' => true,
        'idAlumno' => $idAlumno,
        'totalFaltas' => count($faltas),
        'faltasConsecutivas' => $maxFaltasConsecutivas,
        'esCritico' => $maxFaltasConsecutivas >= 3,
        'mensaje' => $mensaje,
        'mostrarAlerta' => $maxFaltasConsecutivas >= 3
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al verificar faltas',
        'error' => $e->getMessage()
    ]);
}
?>
