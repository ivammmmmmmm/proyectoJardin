<?php
require_once __DIR__ . '/conexion.php';

$stmt = $pdo->query("SELECT * FROM alumno");
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Lista de Alumnos</title>
</head>
<body>
    <h2>Lista de Alumnos</h2>
    <table border="1" cellpadding="5">
        <tr>
            <th>ID</th><th>Nombre</th><th>Apellido</th><th>DNI</th><th>Dirección</th><th>Fecha Nacimiento</th><th colspan="2" >Acciones</th>
        </tr>
    <?php foreach($result as $fila) { ?>
            <tr>
                <td><?= $fila['id'] ?></td>
                <td><?= $fila['nombre'] ?></td>
                <td><?= $fila['apellido'] ?></td>
                <td><?= $fila['dni'] ?></td>
                <td><?= $fila['direccion'] ?></td>
                <td><?= $fila['fecha_nacimiento'] ?></td>
                <td>
                    <a href="modificar.php?id=<?= $fila['id'] ?>">Modificar</a>
                </td>
                <td>
                    <a href="eliminar.php?id=<?php echo $fila['id']; ?>" 
                    onclick="return confirm('¿Seguro que deseas eliminar este alumno?');">
                    Eliminar
</a>
                </td>
            </tr>
        <?php } ?>
    </table>
</body>
</html>
