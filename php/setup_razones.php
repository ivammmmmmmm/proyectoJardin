<?php
require_once 'conexion.php';

try {
    // Habilitar la visualización de errores
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    $conn = Conexion::conectar();
    
    // Insertar razones
    $sql = "INSERT INTO razon (id, nombre) VALUES 
            (1, 'Enfermedad'),
            (2, 'Viaje'),
            (3, 'Trámites'),
            (4, 'Otros')
            ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)";
            
    $conn->exec($sql);
    echo "Razones insertadas correctamente";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>