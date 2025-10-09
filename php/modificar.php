<?php
$conexion = new mysqli("localhost", "root", "", "proyecto_jardin");

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

if (!isset($_GET['id'])) {
    die("ID de alumno no especificado.");
}

$id = intval($_GET['id']);

// Si se envió el formulario → actualizar
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST['nombre'];
    $apellido = $_POST['apellido'];
    $dni = $_POST['dni'];
    $direccion = $_POST['direccion'];
    $fecha_nacimiento = $_POST['fecha_nacimiento'];

    $stmt = $conexion->prepare("UPDATE alumno SET nombre=?, apellido=?, dni=?, direccion=?, fecha_nacimiento=? WHERE id=?");
    $stmt->bind_param("sssssi", $nombre, $apellido, $dni, $direccion, $fecha_nacimiento, $id);

    if ($stmt->execute()) {
        echo "Alumno actualizado correctamente. <a href='lista.php'>Volver</a>";
    } else {
        echo "Error al actualizar: " . $stmt->error;
    }
    exit;
}

// Obtener datos actuales del alumno
$stmt = $conexion->prepare("SELECT * FROM alumno WHERE id=?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$alumno = $result->fetch_assoc();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Modificar Alumno</title>
</head>

<body>
    <h2>Modificar Alumno</h2>
    <form method="post">
        Nombre: <input type="text" name="nombre" value="<?= $alumno['nombre'] ?>" required><br><br>
        Apellido: <input type="text" name="apellido" value="<?= $alumno['apellido'] ?>" required><br><br>
        DNI: <input type="text" name="dni" value="<?= $alumno['dni'] ?>" required><br><br>
        Dirección: <input type="text" name="direccion" value="<?= $alumno['direccion'] ?>" required><br><br>
        Fecha Nacimiento: <input type="date" name="fecha_nacimiento" value="<?= $alumno['fecha_nacimiento'] ?>"
            required><br><br>
        <input type="submit" value="Guardar Cambios">
    </form>
</body>

</html>