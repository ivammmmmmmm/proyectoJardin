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

    // Obtener la conexión PDO
    $pdo = Conexion::conectar();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        header('Location: ../html/aniadirTutor.html');
        exit;
    }

    $nombre = trim($_POST['nombre'] ?? '');
    $apellido = trim($_POST['apellido'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $direccion = trim($_POST['direccion'] ?? '');
    $localidad = isset($_POST['localidad']) && $_POST['localidad'] !== '' ? intval($_POST['localidad']) : 0;
    $mail = trim($_POST['mail'] ?? '');

    if ($nombre === '' || $apellido === '') {
        header('Location: ../html/aniadirTutor.html?error=missing');
        exit;
    }

    try {
        $sql = "INSERT INTO padretutor (nombre, apellido, telefono, direccion, idLocalidad, mail) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        if (!$stmt) throw new Exception('Error preparando consulta: ' . implode(' | ', $pdo->errorInfo()));

        if (!$stmt->execute([$nombre, $apellido, $telefono, $direccion, $localidad, $mail])) {
            throw new Exception('Error ejecutando consulta: ' . implode(' | ', $stmt->errorInfo()));
        }

        header('Location: ../html/aniadirTutor.html?ok=1');
        exit;
    } catch (Exception $e) {
        $logDir = __DIR__ . '/logs';
        if (!is_dir($logDir)) mkdir($logDir, 0755, true);
        $msg = date('Y-m-d H:i:s') . " | aniadirTutor.php | " . $e->getMessage() . "\n";
        file_put_contents($logDir . '/db_errors.log', $msg, FILE_APPEND | LOCK_EX);

        header('Location: ../html/aniadirTutor.html?error=sql');
        exit;
    }
    ?>