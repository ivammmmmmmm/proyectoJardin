<?php
include("conexion.php");

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
    foreach ($errors as $err) echo $err . "<br>";
    exit;
}

// Convertir DNI a entero
$dni_int = (int)$dni;

// -------------------
// Insertar alumno
// -------------------
$stmt = mysqli_prepare($conexion,
    "INSERT INTO alumno (nombre, apellido, dni, direccion, fecha_nacimiento)
     VALUES (?, ?, ?, ?, ?)"
);
mysqli_stmt_bind_param($stmt, "ssiss", $nombre, $apellido, $dni_int, $direccion, $fecha_nacimiento);

if (!mysqli_stmt_execute($stmt)) {
    echo "Error al guardar alumno: " . mysqli_stmt_error($stmt);
    mysqli_stmt_close($stmt);
    mysqli_close($conexion);
    exit;
}

$id_alumno = mysqli_insert_id($conexion);
mysqli_stmt_close($stmt);

// -------------------
// Datos de tutores
// -------------------
$tutor_nombres   = $_POST['tutor_nombre'] ?? [];
$tutor_apellidos = $_POST['tutor_apellido'] ?? [];
$tutor_telefonos = $_POST['tutor_telefono'] ?? [];
$tutor_direccion = $_POST['tutor_direccion'] ?? [];

if (count($tutor_nombres) < 1) {
    echo "Debe registrar al menos un tutor.";
    mysqli_close($conexion);
    exit;
}

// -------------------
// Insertar tutores y vincularlos
// -------------------
$tutores_registrados = []; // para guardar los datos y mostrarlos al final

for ($i = 0; $i < count($tutor_nombres); $i++) {
    $t_nombre = trim($tutor_nombres[$i]);
    $t_apellido = trim($tutor_apellidos[$i]);
    $t_telefono = trim($tutor_telefonos[$i]);
    $t_direccion = trim($tutor_direccion[$i]);

    if ($t_nombre === '' || $t_apellido === '') {
        continue; // saltar tutores incompletos
    }

    // Insertar tutor en padreTutor
    $stmt = mysqli_prepare($conexion,
        "INSERT INTO padreTutor (nombre, apellido, telefono, direccion) VALUES (?, ?, ?, ?)"
    );
    mysqli_stmt_bind_param($stmt, "ssss", $t_nombre, $t_apellido, $t_telefono, $t_direccion);
    mysqli_stmt_execute($stmt);
    $id_padre = mysqli_insert_id($conexion);
    mysqli_stmt_close($stmt);

    // Vincular alumno y tutor
    $stmt = mysqli_prepare($conexion,
        "INSERT INTO alumnotutor (idAlumno, idPadreTutor) VALUES (?, ?)"
    );
    mysqli_stmt_bind_param($stmt, "ii", $id_alumno, $id_padre);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);

    // Guardar datos en array para mostrarlos al final
    $tutores_registrados[] = [
        'nombre' => $t_nombre,
        'apellido' => $t_apellido,
        'telefono' => $t_telefono,
        'direccion' => $t_direccion
    ];
}

// -------------------
// Mensaje final
// -------------------
echo "<h3>Alumno registrado correctamente</h3>";
echo "Alumno: $nombre $apellido<br>";
echo "DNI: $dni_int<br>";
echo "Dirección: $direccion<br>";
echo "Fecha de nacimiento: $fecha_nacimiento<br>";
echo "Cantidad de tutores registrados: " . count($tutores_registrados) . "<br><br>";

echo "<h4>Datos de los tutores:</h4>";
foreach ($tutores_registrados as $idx => $t) {
    echo "<b>Tutor " . ($idx + 1) . ":</b><br>";
    echo "Nombre: " . $t['nombre'] . "<br>";
    echo "Apellido: " . $t['apellido'] . "<br>";
    echo "Teléfono: " . $t['telefono'] . "<br>";
    echo "Dirección: " . $t['direccion'] . "<br><br>";
}

mysqli_close($conexion);
?>
