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

    // Log de debug
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) mkdir($logDir, 0755, true);
    
    error_log("aniadirAlumno.php - REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD'], 3, $logDir . '/debug.log');
    error_log("aniadirAlumno.php - POST data: " . print_r($_POST, true), 3, $logDir . '/debug.log');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        header('Location: ../html/aniadirAlumno.html');
        exit;
    }

    $nombre = trim($_POST['nombre'] ?? '');
    $apellido = trim($_POST['apellido'] ?? '');
    $dni = trim($_POST['dni'] ?? '');
    $direccion = trim($_POST['direccion'] ?? '');
    $nacimiento = trim($_POST['nacimiento'] ?? '');
    $localidad = isset($_POST['localidad']) && $_POST['localidad'] !== '' ? intval($_POST['localidad']) : 0;
    $sala = isset($_POST['sala']) && $_POST['sala'] !== '' ? intval($_POST['sala']) : null;

    // Obtener tutores seleccionados (array de ids)
    $tutoresSeleccionados = [];
    if (isset($_POST['tutores']) && is_array($_POST['tutores'])) {
        foreach ($_POST['tutores'] as $t) {
            if (ctype_digit((string)$t)) $tutoresSeleccionados[] = (int)$t;
        }
    }
    
    error_log("aniadirAlumno.php - Tutores seleccionados: " . count($tutoresSeleccionados), 3, $logDir . '/debug.log');

    if ($nombre === '' || $apellido === '') {
        header('Location: ../html/aniadirAlumno.html?error=missing');
        exit;
    }

    try {
        // Detectar si la columna idLocalidad existe en la tabla alumno
        $hasLocalidad = false;
        $hasEstado = false;
        
        $stmtCheck = $pdo->query("SHOW COLUMNS FROM alumno LIKE 'idLocalidad'");
        if ($stmtCheck && $stmtCheck->fetch()) {
            $hasLocalidad = true;
        }
        
        $stmtCheck = $pdo->query("SHOW COLUMNS FROM alumno LIKE 'idEstado'");
        if ($stmtCheck && $stmtCheck->fetch()) {
            $hasEstado = true;
        }
        
        error_log("aniadirAlumno.php - hasLocalidad: $hasLocalidad, hasEstado: $hasEstado", 3, $logDir . '/debug.log');

        // Iniciar transacción
        $pdo->beginTransaction();

        if ($hasLocalidad && $hasEstado) {
            $sql = "INSERT INTO alumno (nombre, apellido, dni, direccion, fecha_nacimiento, idLocalidad, idEstado) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$nombre, $apellido, $dni, $direccion, $nacimiento, $localidad, 1]);
        } elseif ($hasLocalidad && !$hasEstado) {
            $sql = "INSERT INTO alumno (nombre, apellido, dni, direccion, fecha_nacimiento, idLocalidad) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$nombre, $apellido, $dni, $direccion, $nacimiento, $localidad]);
        } elseif (!$hasLocalidad && $hasEstado) {
            $sql = "INSERT INTO alumno (nombre, apellido, dni, direccion, fecha_nacimiento, idEstado) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$nombre, $apellido, $dni, $direccion, $nacimiento, 1]);
        } else {
            // Si no existe ninguna de las dos
            $sql = "INSERT INTO alumno (nombre, apellido, dni, direccion, fecha_nacimiento) VALUES (?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$nombre, $apellido, $dni, $direccion, $nacimiento]);
        }

        $alumnoId = $pdo->lastInsertId();

        // Insertar relaciones en alumnotutor
        if (!empty($tutoresSeleccionados)) {
            $stmtIns = $pdo->prepare("INSERT INTO alumnotutor (idPadreTutor, idAlumno) VALUES (?, ?)");
            foreach ($tutoresSeleccionados as $tid) {
                if (!$stmtIns->execute([$tid, $alumnoId])) {
                    throw new Exception('Error insert alumnotutor: ' . implode(' | ', $stmtIns->errorInfo()));
                }
            }
        }

        $pdo->commit();

        // Mostrar alert y redirigir a index.html
        echo "<!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <title>Alumno Registrado</title>
        </head>
        <body>
            <script>
                alert('¡Alumno registrado correctamente!');
                window.location.href = '../html/index.html';
            </script>
        </body>
        </html>";
        exit;
    } catch (Exception $e) {
        $pdo->rollBack();
        $logDir = __DIR__ . '/logs';
        if (!is_dir($logDir)) mkdir($logDir, 0755, true);
        $msg = date('Y-m-d H:i:s') . " | aniadirAlumno.php | " . $e->getMessage() . "\n";
        file_put_contents($logDir . '/db_errors.log', $msg, FILE_APPEND | LOCK_EX);

        header('Location: ../html/aniadirAlumno.html?error=sql');
        exit;
    }
    ?>
