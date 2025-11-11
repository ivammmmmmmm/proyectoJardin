<?php
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once 'conexion.php';
    
    // Probar la conexión usando la clase Conexion
    try {
        $pdo = Conexion::conectar();
        error_log('Conexión establecida exitosamente usando la clase Conexion');
    } catch (Exception $e) {
        throw new Exception('Error al conectar usando la clase Conexion: ' . $e->getMessage());
    }

    // Probar consultas a las tablas principales
    $tables = [
        'alumno' => "SELECT COUNT(*) as count FROM alumno",
        'docente' => "SELECT COUNT(*) as count FROM docente",
        'sala' => "SELECT COUNT(*) as count FROM sala",
        'padretutor' => "SELECT COUNT(*) as count FROM padretutor"
    ];

    $results = [];
    foreach ($tables as $table => $query) {
        try {
            $stmt = $pdo->query($query);
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            $results[$table] = [
                'status' => 'ok',
                'registros' => $count
            ];
        } catch (PDOException $e) {
            $results[$table] = [
                'status' => 'error',
                'mensaje' => $e->getMessage()
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Conexión exitosa',
        'tables' => $results
    ]);

} catch (Exception $e) {
    error_log('Error en test_connection.php: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
