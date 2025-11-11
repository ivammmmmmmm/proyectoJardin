<?php
require_once("conexion.php");
$pdo = Conexion::conectar();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die('Acceso inválido. Envía el formulario desde el HTML.');
}

// -------------------
// Datos del alumno
// -------------------
$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$dni = trim($_POST['dni'] ?? '');
$direccion = trim($_POST['direccion'] ?? '');
$fecha_nacimiento = trim($_POST['fecha_nacimiento'] ?? '');

// -------------------
// Validaciones básicas
// -------------------
$errors = [];
if ($nombre === '') $errors[] = 'Nombre obligatorio.';
if ($apellido === '') $errors[] = 'Apellido obligatorio.';
if ($dni === '' || !ctype_digit($dni)) $errors[] = 'DNI obligatorio y numérico.';
if ($direccion === '') $errors[] = 'Dirección obligatoria.';
if ($fecha_nacimiento === '') $errors[] = 'Fecha de nacimiento obligatoria.';

if (!empty($errors)) {
    foreach ($errors as $err) echo htmlspecialchars($err) . "<br>";
    exit;
}

// Convertir DNI a entero
$dni_int = (int)$dni;

// Preparar tutores desde POST (asegurar arrays)
$tutor_nombres   = $_POST['tutor_nombre'] ?? [];
$tutor_apellidos = $_POST['tutor_apellido'] ?? [];
$tutor_telefonos = $_POST['tutor_telefono'] ?? [];
$tutor_direccion = $_POST['tutor_direccion'] ?? [];

if (!is_array($tutor_nombres)) $tutor_nombres = [$tutor_nombres];
if (!is_array($tutor_apellidos)) $tutor_apellidos = [$tutor_apellidos];
if (!is_array($tutor_telefonos)) $tutor_telefonos = [$tutor_telefonos];
if (!is_array($tutor_direccion)) $tutor_direccion = [$tutor_direccion];

// -------------------
// Insertar alumno y tutores usando PDO
// -------------------
$tutores_registrados = [];

try {
    if (!isset($pdo)) {
        throw new Exception('No se pudo establecer la conexión a la base de datos');
    }

    $pdo->beginTransaction();

    // Insertar alumno
    $stmt = $pdo->prepare(
        "INSERT INTO alumno (nombre, apellido, dni, direccion, fecha_nacimiento)
         VALUES (?, ?, ?, ?, ?)"
    );
    $ok = $stmt->execute([$nombre, $apellido, $dni_int, $direccion, $fecha_nacimiento]);
    if (!$ok) {
        $err = $stmt->errorInfo();
        throw new Exception('Error al guardar alumno: ' . implode(' | ', $err));
    }

    $id_alumno = $pdo->lastInsertId();

    // Validar que exista al menos un tutor con datos válidos
    $validTutorCount = 0;
    for ($i = 0; $i < count($tutor_nombres); $i++) {
        $t_nombre = trim($tutor_nombres[$i] ?? '');
        $t_apellido = trim($tutor_apellidos[$i] ?? '');
        if ($t_nombre === '' || $t_apellido === '') continue;
        $validTutorCount++;
    }

    if ($validTutorCount < 1) {
        $pdo->rollBack();
        echo "Debe registrar al menos un tutor.";
        exit;
    }

    // Insertar tutores y vínculos
    $stmtInsertTutor = $pdo->prepare("INSERT INTO padreTutor (nombre, apellido, telefono, direccion) VALUES (?, ?, ?, ?)");
    $stmtLink = $pdo->prepare("INSERT INTO alumnotutor (idAlumno, idPadreTutor) VALUES (?, ?)");

    for ($i = 0; $i < count($tutor_nombres); $i++) {
        $t_nombre = trim($tutor_nombres[$i] ?? '');
        $t_apellido = trim($tutor_apellidos[$i] ?? '');
        $t_telefono = trim($tutor_telefonos[$i] ?? '');
        $t_direccion = trim($tutor_direccion[$i] ?? '');

        if ($t_nombre === '' || $t_apellido === '') {
            continue; // saltar tutores incompletos
        }

        $ok = $stmtInsertTutor->execute([$t_nombre, $t_apellido, $t_telefono, $t_direccion]);
        if (!$ok) {
            $err = $stmtInsertTutor->errorInfo();
            throw new Exception('Error insertando tutor: ' . implode(' | ', $err));
        }
        $id_padre = $pdo->lastInsertId();

        $ok = $stmtLink->execute([$id_alumno, $id_padre]);
        if (!$ok) {
            $err = $stmtLink->errorInfo();
            throw new Exception('Error vinculando tutor: ' . implode(' | ', $err));
        }

        $tutores_registrados[] = [
            'nombre' => $t_nombre,
            'apellido' => $t_apellido,
            'telefono' => $t_telefono,
            'direccion' => $t_direccion
        ];
    }

    $pdo->commit();

    // -------------------
    // Mensaje final (salida HTML similar a la original)
    // -------------------
    echo "<h3>Alumno registrado correctamente</h3>";
    echo "Alumno: " . htmlspecialchars($nombre) . " " . htmlspecialchars($apellido) . "<br>";
    echo "DNI: " . htmlspecialchars($dni_int) . "<br>";
    echo "Dirección: " . htmlspecialchars($direccion) . "<br>";
    echo "Fecha de nacimiento: " . htmlspecialchars($fecha_nacimiento) . "<br>";
    echo "Cantidad de tutores registrados: " . count($tutores_registrados) . "<br><br>";

    echo "<h4>Datos de los tutores:</h4>";
    foreach ($tutores_registrados as $idx => $t) {
        echo "<b>Tutor " . ($idx + 1) . ":</b><br>";
        echo "Nombre: " . htmlspecialchars($t['nombre']) . "<br>";
        echo "Apellido: " . htmlspecialchars($t['apellido']) . "<br>";
        echo "Teléfono: " . htmlspecialchars($t['telefono']) . "<br>";
        echo "Dirección: " . htmlspecialchars($t['direccion']) . "<br><br>";
    }

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('ingreso.php exception: ' . $e->getMessage());
    echo "<p>Error al registrar alumno: " . htmlspecialchars($e->getMessage()) . "</p>";
    exit;
}
?>
