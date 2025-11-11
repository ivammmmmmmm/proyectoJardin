<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'conexion.php';

try {
    $pdo = Conexion::conectar();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Intentamos primero filtrar por activo si la columna existe en la tabla.
    $query = "SELECT id, nombre FROM razon WHERE activo = 1 ORDER BY nombre";
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $razones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Si la columna 'activo' no existe, reintentar sin la cláusula WHERE
        if (stripos($e->getMessage(), "Unknown column 'activo'") !== false || stripos($e->getMessage(), 'SQLSTATE[42S22]') !== false) {
            // Fallback: solicitar todas las razones sin filtrar por activo
            $fallbackQuery = "SELECT id, nombre FROM razon ORDER BY nombre";
            $stmt = $pdo->prepare($fallbackQuery);
            $stmt->execute();
            $razones = $stmt->fetchAll(PDO::FETCH_ASSOC);
            // Añadir una nota en el mensaje para el cliente
            echo json_encode([
                'success' => true,
                'message' => count($razones) > 0 ? 'Razones obtenidas (sin filtro activo)' : 'No hay razones disponibles',
                'data' => $razones
            ]);
            exit;
        } else {
            // Re-throw para ser capturado por el bloque externo
            throw $e;
        }
    }

    echo json_encode([
        'success' => true,
        'message' => count($razones) > 0 ? 'Razones obtenidas correctamente' : 'No hay razones disponibles',
        'data' => $razones
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener las razones',
        'error' => $e->getMessage()
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error general',
        'error' => $e->getMessage()
    ]);
}
?>