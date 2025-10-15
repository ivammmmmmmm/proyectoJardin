<?php
$servidor = "localhost";
$usuario = "root";
$contrasenia = ""; // Cambia esto si tenés contraseña
$basedatos = "proyecto_jardin"; // Asegurate de que esta base exista

$conexion = mysqli_connect($servidor, $usuario, $contrasenia, $basedatos);

if ($conexion->connect_errno) {
	echo
		'<div class="container">
	    <br>
	    <br><center>
	    	
	    	<h2><b>ERROR DE CONEXION</b></h2>
	    </center>
	    No ha sido posible conectarse con la base de datos, <b>¡Fresco! NO es un error grave</b> pero puede ser causado por cualquiera de los siguientes motivos:<br><br>

	    <ul>
	    	<li><b>Datos incorrectos en el archivo "Abrir_Conexion.php"</b> <font color="GREEN">(Más Común)</font></li>
	    	<li>NO ha creado la base de datos en MySQL</li>
	    	<li>NO ha activado MySQL en Xampp o AppServer</li>
	    </ul> 
	    </div>';
	exit();
}
