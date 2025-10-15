<?php
// me voy a matar y grabarlo
//FIXME
require "conexion.php";

$columnas= ['id', 'nombre', 'apellido', 'dni', 'direccion', 'fecha_nacimiento'];
$tabla="alumno";
$campo = isset($_POST['campo']) ? $conexion->real_escape_string($_POST['campo']) : null;

$where= '';

if($campo!=null){
    $where = "WHERE (idEstado=1 AND";
    $cont=count($columnas);
    for($x=0; $x<$cont; $x++){
        $where .=$columnas[$x]." LIKE '%".$campo."%' OR ";
    }
    $where=substr_replace($where, "", -3);
    $where.=")";
}

$sql ="SELECT ".implode(", ", $columnas)." FROM $tabla $where";

$resultado = $conexion->query($sql);

$num_rows = $resultado->num_rows; // cuenta la cantidad de filas que hay en el resultado

$html = '';

if ($num_rows > 0) {
    while ($row = $resultado->fetch_assoc()) {
        $edad = date_diff(date_create($row['fecha_nacimiento']), date_create('today'))->y;

        $html .='<div class="list-group-item bg-dark text-light"> <div class="d-flex justify-content-between align-items-center"> <div class="d-flex align-items-center"> <i class="bi bi-person fs-3 me-3 text-light"></i> <div>';
        $html .='<h5 class="mb-0 text-light">'.$row['nombre'].' '.$row['apellido'].'</h5>';
        $html .='</div> </div> <div class="d-flex gap-2">';
        $html .='<button class="btn btn-danger btn-sm">Eliminar</button>';
        $html .='<button class="btn btn-secondary btn-sm">Modificar</button>';
        $html .='<button class="btn btn-info btn-sm text-white" data-bs-toggle="collapse" data-bs-target="#infoUser1" aria-expanded="false" aria-controls="infoUser1">Ver Info.</button>';
        $html .='</button></div></div></div>';
        $html .='<div class="collapse mt-3" id="infoUser1" data-bs-parent="#usuariosLista"><div class="p-3 bg-info rounded">';
        $html .='<p><strong>ID:</strong>'.$row['id'].'</p>';
        $html .='<p><strong>DNI:</strong>'.$row['dni'].'</p>';
        $html .='<p><strong>Edad:</strong>'.$edad.'</p>';
        $html .='<p><strong>Fecha de Nacimiento:</strong>'.$row['fecha_nacimiento'].'</p>';
        $html .='<p><strong>Dirección:</strong>'.$row['direccion'].'</p>';
        $html .='</div></div>';
    }
} else{
    $html .= '<strong>No se encontraron alumnos</strong>';
}

echo json_encode($html,JSON_UNESCAPED_UNICODE);

mysqli_close($conexion);
