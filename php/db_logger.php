<?php
function logError($filename, $error) {
    try {
        $log_dir = __DIR__ . '/logs';
        $log_file = $log_dir . '/db_errors.log';

        // Asegurarse de que el directorio existe
        if (!is_dir($log_dir)) {
            mkdir($log_dir, 0777, true);
            // En Windows, necesitamos establecer los permisos después de crear el directorio
            chmod($log_dir, 0777);
        }

        // Si el archivo no existe, crearlo y establecer permisos
        if (!file_exists($log_file)) {
            touch($log_file);
            chmod($log_file, 0666);
        }

        $date = date('Y-m-d H:i:s');
        $log_message = "$date | $filename | $error\n";
        
        // Intentar escribir el log
        if (file_put_contents($log_file, $log_message, FILE_APPEND | LOCK_EX) === false) {
            error_log("Error escribiendo en el log: $log_file");
        }
    } catch (Exception $e) {
        error_log("Error en logError: " . $e->getMessage());
    }
}