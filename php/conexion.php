<?php
$servidor = "localhost";
$usuario = "root";
$contrasenia = ""; // Cambia esto si tenés contraseña
$basedatos = "proyecto_jardin"; // Asegurate de que esta base exista

$conexion = mysqli_connect($servidor, $usuario, $contrasenia, $basedatos);

if (!$conexion) {
    die("Conexión fallida: " . mysqli_connect_error());
}
?>
