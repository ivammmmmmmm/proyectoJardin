<?php
//
//FIXME
require "conexion.php";
$columnas= ['alumno.id', 'alumno.nombre', 'alumno.apellido', 'alumno.dni', 'alumno.direccion', 'alumno.fecha_nacimiento', 'estado.nombre as nombreestado'];
$tabla="alumno";
$campo = isset($_POST['campo']) ? $conexion->real_escape_string($_POST['campo']) : null;

$where= '';

if($campo!=null){
    $where = "WHERE (";
    $cont=count($columnas);
    for($x=0; $x<$cont; $x++){
        $where .=$columnas[$x]." LIKE '%".$campo."%' OR ";
    }
    $where=substr_replace($where, "", -3);
    $where.=")";
}

$sql ="SELECT ".implode(", ", $columnas)." FROM $tabla JOIN estado ON alumno.idEstado=estado.id $where;";

$resultado = $conexion->query($sql);

$num_rows = $resultado->num_rows; // cuenta la cantidad de filas que hay en el resultado

$html = '';

if ($num_rows > 0) {
    while ($row = $resultado->fetch_assoc()) {
        $edad = date_diff(date_create($row['alumno.fecha_nacimiento']), date_create('today'))->y;

        $html .= '<div class="list-group-item bg-dark text-light">';
        $html .= '  <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">';
        $html .= '    <div class="d-flex align-items-center">';
        $html .= '      <i class="bi bi-person fs-3 me-3 text-light"></i>';
        $html .= '      <div><h5 class="mb-0 text-light text-break">'.$row['nombre'].' '.$row['apellido'].'</h5></div>';
        $html .= '    </div>';
        $html .= '    <div class="d-flex flex-wrap gap-2 w-100 w-sm-auto justify-content-end">';
        $html .= '      <button class="btn btn-danger btn-sm">Eliminar</button>';
        $html .= '      <button class="btn btn-secondary btn-sm">Modificar</button>';
        $html .= '      <button class="btn btn-info btn-sm text-white toggle-info">Ver Info.</button>';
        $html .= '    </div>';
        $html .= '  </div>';
        $html .= '  <div class="info-content collapse mt-3">';
        $html .= '    <div class="p-3 bg-info rounded text-center mb-2">';
        $html .= '      <p><strong>ID:</strong> '.$row['id'].'</p>';
        $html .= '      <p><strong>DNI:</strong> '.$row['dni'].'</p>';
        $html .= '      <p><strong>Edad:</strong> '.$edad.'</p>';
        $html .= '      <p><strong>Fecha de Nacimiento:</strong> '.$row['fecha_nacimiento'].'</p>';
        $html .= '      <p><strong>Dirección:</strong> '.$row['direccion'].'</p>';
        $html .= '      <p><strong>Estado:</strong> '.$row['nombreestado'].'</p>';
        $html .= '    </div>';
        $html .= '  </div>';
        $html .= '</div>';
    }
} else{
    $html .= '<strong>No se encontraron alumnos</strong>';
}

echo json_encode($html,JSON_UNESCAPED_UNICODE);

mysqli_close($conexion);
