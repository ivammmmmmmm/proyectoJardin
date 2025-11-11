<?php
// Allow cross-origin requests for development (ngrok / mobile app).
// Remove or restrict this in production.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit; // respond to preflight
}

class Conexion {
    private static $instance = null;
    private static $pdo = null;

    private function __construct() {} // Constructor privado para el patrón Singleton

    public static function conectar() {
        if (self::$pdo === null) {
            try {
                $host = 'localhost';
                $dbname = 'proyecto_jardin';
                $username = 'root';
                $password = '';
                $charset = 'utf8mb4';

                $dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];

                error_log("conexion.php: Intentando conectar a $dbname en $host");
                self::$pdo = new PDO($dsn, $username, $password, $options);
                error_log('conexion.php: Conexión PDO creada exitosamente');
                
                return self::$pdo;
            } catch (PDOException $e) {
                error_log('Error de conexión: ' . $e->getMessage());
                throw new Exception('Error de conexión a la base de datos: ' . $e->getMessage());
            }
        }
        return self::$pdo;
    }
}
?>
