<?php
require_once __DIR__ . '/conexion.php';

try {
    if (!isset($_GET['id'])) {
        throw new Exception('ID de alumno no especificado.');
    }

    $id = intval($_GET['id']);

    // Si se envió el formulario → actualizar
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $nombre = $_POST['nombre'] ?? '';
        $apellido = $_POST['apellido'] ?? '';
        $dni = $_POST['dni'] ?? '';
        $direccion = $_POST['direccion'] ?? '';
        $fecha_nacimiento = $_POST['fecha_nacimiento'] ?? null;

        $stmt = $pdo->prepare("UPDATE alumno SET nombre = ?, apellido = ?, dni = ?, direccion = ?, fecha_nacimiento = ? WHERE id = ?");
        $updated = $stmt->execute([$nombre, $apellido, $dni, $direccion, $fecha_nacimiento, $id]);

        if ($updated) {
            echo "Alumno actualizado correctamente. <a href='lista.php'>Volver</a>";
        } else {
            echo "Error al actualizar.";
        }
        exit;
    }

    // Obtener datos actuales del alumno
    $stmt = $pdo->prepare("SELECT * FROM alumno WHERE id = ?");
    $stmt->execute([$id]);
    $alumno = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$alumno) {
        throw new Exception('Alumno no encontrado');
    }

} catch (Exception $e) {
    // Mostrar un mensaje simple en caso de error
    echo '<p>Error: ' . htmlspecialchars($e->getMessage()) . '</p>';
    echo "<p><a href='lista.php'>Volver</a></p>";
    exit;
}
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
        Fecha Nacimiento: <input type="date" name="fecha_nacimiento" value="<?= $alumno['fecha_nacimiento'] ?>" required><br><br>
        <input type="submit" value="Guardar Cambios">
    </form>
</body>
</html>
