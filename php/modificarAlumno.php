<?php
//
//FIXME
require "conexion.php";

// columnas para el SELECT (pueden tener alias)
$columnas_select = [
    'alumno.id',
    'alumno.nombre AS nombre_alumno',
    'alumno.apellido',
    'alumno.dni',
    'alumno.direccion',
    'alumno.fecha_nacimiento AS fechanacimiento',
    'estado.nombre AS nombre_estado'
];

// columnas para el WHERE (sin alias)
$columnas_busqueda = [
    'alumno.id',
    'alumno.nombre',
    'alumno.apellido',
    'alumno.dni',
    'alumno.direccion',
    'alumno.fecha_nacimiento',
    'estado.nombre'
];

$tabla = "alumno";
$campo = isset($_POST['campo']) ? $conexion->real_escape_string($_POST['campo']) : null;

$where = '';

if ($campo != null) {
    $where = "WHERE (";
    foreach ($columnas_busqueda as $col) {
        $where .= "$col LIKE '%$campo%' OR ";
    }
    $where = substr_replace($where, "", -3);
    $where .= ")";
}

$sql = "SELECT " . implode(", ", $columnas_select) . " 
        FROM $tabla 
        JOIN estado ON alumno.idEstado = estado.id 
        $where;";

$resultado = $conexion->query($sql);

$num_rows = $resultado->num_rows; // cuenta la cantidad de filas que hay en el resultado

$html = '';

if ($num_rows > 0) {
    while ($row = $resultado->fetch_assoc()) {
        $edad = date_diff(date_create($row['fechanacimiento']), date_create('today'))->y;

        $html .= '<div class="list-group-item bg-dark text-light">';
        $html .= '  <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">';
        $html .= '    <div class="d-flex align-items-center">';
        $html .= '      <i class="bi bi-person fs-3 me-3 text-light"></i>';
        $html .= '      <div><h5 class="mb-0 text-light text-break">' . $row['nombre_alumno'] . ' ' . $row['apellido'] . '</h5></div>';
        $html .= '    </div>';
        $html .= '    <div class="d-flex flex-wrap gap-2 w-100 w-sm-auto justify-content-end">';
        $html .= '      <button class="btn btn-danger btn-sm" onclick="abrirModalEliminar('.$row['id'].');">Eliminar</button>';
        $html .= '      <button class="btn btn-secondary btn-sm" onclick="abrirModalModificar('.$row['id'].');">Modificar</button>';
        $html .= '      <button class="btn btn-info btn-sm text-white toggle-info" data-bs-toggle="collapse" data-bs-target="#info'.$row['id'].'">Ver Info.</button>';
        $html .= '    </div>';
        $html .= '  </div>';
        $html .= '  <div class="info-content collapse mt-3" id="info'.$row['id'].'">';
        $html .= '    <div class="p-3 bg-info rounded text-center mb-2">';
        $html .= '      <p><strong>ID:</strong> ' . $row['id'] . '</p>';
        $html .= '      <p><strong>DNI:</strong> ' . $row['dni'] . '</p>';
        $html .= '      <p><strong>Edad:</strong> ' . $edad . '</p>';
        $html .= '      <p><strong>Fecha de Nacimiento:</strong> ' . $row['fechanacimiento'] . '</p>';
        $html .= '      <p><strong>Dirección:</strong> ' . $row['direccion'] . '</p>';
        $html .= '      <p><strong>Estado:</strong> ' . $row['nombre_estado'] . '</p>';
        $html .= '    </div>';
        $html .= '  </div>';
        $html .= '</div>';
    }
} else {
    $html .= '<strong>No se encontraron alumnos</strong>';
}

echo $html;

mysqli_close($conexion);
