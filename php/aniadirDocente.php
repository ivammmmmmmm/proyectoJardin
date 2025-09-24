<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <?php
        include("conexion.php");

        $nombre=$_POST['nombre'];
        $apellido=$_POST['apellido'];
        $estado=1;

        mysqli_query($conexion,"insert into docente (nombre,apellido,estado) values ('$nombre','$apellido',$estado);");
        mysqli_close($conexion);
    ?>
</body>
</html>