<?php
include("conexion.php");

// Verificar que venga un id por GET
if (!isset($_GET['id']) || !ctype_digit($_GET['id'])) {
    die("ID de alumno inválido.");
}

$id = (int) $_GET['id'];

// 1) Eliminar vínculos con tutores
$stmt = mysqli_prepare($conexion, "DELETE FROM alumnotutor WHERE id = ?");
mysqli_stmt_bind_param($stmt, "i", $id);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

// 2) Eliminar alumno
$stmt = mysqli_prepare($conexion, "DELETE FROM alumno WHERE id = ?");
mysqli_stmt_bind_param($stmt, "i", $id);

if (mysqli_stmt_execute($stmt)) {
    echo "<h3>Alumno eliminado correctamente.</h3>";
} else {
    echo "Error al eliminar alumno: " . mysqli_stmt_error($stmt);
}

mysqli_stmt_close($stmt);
mysqli_close($conexion);
?>