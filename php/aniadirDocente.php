<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <?php
        require_once __DIR__ . '/conexion.php';

        // Esperamos POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: ../html/aniadirDocente.html');
            exit;
        }

        // Recolectar y sanitizar datos básicos
        $nombre = trim($_POST['nombre'] ?? '');
        $apellido = trim($_POST['apellido'] ?? '');
        $telefono = trim($_POST['telefono'] ?? '');
        $mail = trim($_POST['gmail'] ?? $_POST['mail'] ?? '');
        $dni = trim($_POST['dni'] ?? '');
        $direccion = trim($_POST['direccion'] ?? '');
        $nacimiento = trim($_POST['nacimiento'] ?? '');
        $localidad = isset($_POST['localidad']) && $_POST['localidad'] !== '' ? intval($_POST['localidad']) : null;

        // Validación mínima
        if ($nombre === '' || $apellido === '') {
            header('Location: ../html/aniadirDocente.html?error=missing');
            exit;
        }

        // Normalizar campos numéricos
        $dniInt = $dni !== '' ? intval($dni) : 0;
        $telefonoInt = $telefono !== '' ? intval($telefono) : 0;
        $idEstado = 1; // estado por defecto

        try {
            $sql = "INSERT INTO docente (nombre, apellido, dni, direccion, telefono, mail, idEstado) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            if (!$stmt) {
                throw new Exception('Error preparando consulta: ' . implode(' | ', $pdo->errorInfo()));
            }

            if (!$stmt->execute([$nombre, $apellido, $dniInt, $direccion, $telefonoInt, $mail, $idEstado])) {
                throw new Exception('Error ejecutando consulta: ' . implode(' | ', $stmt->errorInfo()));
            }

            header('Location: ../html/aniadirDocente.html?ok=1');
            exit;
        } catch (Exception $e) {
            // Log error
            $logDir = __DIR__ . '/logs';
            if (!is_dir($logDir)) mkdir($logDir, 0755, true);
            $msg = date('Y-m-d H:i:s') . " | aniadirDocente.php | " . $e->getMessage() . "\n";
            file_put_contents($logDir . '/db_errors.log', $msg, FILE_APPEND | LOCK_EX);

            header('Location: ../html/aniadirDocente.html?error=sql');
            exit;
        }
    ?>
