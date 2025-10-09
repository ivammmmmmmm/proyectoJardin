<?php
//no se pq no andan los acordeones en php con ajax, pero bueno
//ya m voy a dormir pq son casi las 4 y mañana hay taller
//FIXME

include("conexion.php");
$resultado = mysqli_query($conexion, "SELECT * from alumno WHERE idEstado=1");
while ($consulta = mysqli_fetch_array($resultado)) {
    ?>

    <div class="list-group-item bg-dark text-light">
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <i class="bi bi-person fs-3 me-3 text-light"></i>
                <div>
                    <h5 class="mb-0 text-light"><?php echo $consulta['nombre'] . " " . $consulta['apellido']; ?></h5>
                </div>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-danger btn-sm">Eliminar</button>
                <button class="btn btn-secondary btn-sm">Modificar</button>
                <button class="btn btn-info btn-sm text-white" data-bs-toggle="collapse" data-bs-target="#infoUser1"
                    aria-expanded="false" aria-controls="infoUser1">
                    Ver Info.
                </button>
            </div>
        </div>
    </div>


    <div class="collapse mt-3" id="infoUser1" data-bs-parent="#usuariosLista">
        <div class="p-3 bg-info rounded">
            <p><strong>ID:</strong> <?php echo $consulta['id']; ?></p>
            <p><strong>DNI:</strong> <?php echo $consulta['dni']; ?></p>
            <p><strong>Edad:</strong>
                <?php echo date_diff(date_create($consulta['fecha_nacimiento']), date_create('today'))->y; ?> </p>
            <p><strong>Fecha de Nacimiento:</strong> <?php echo $consulta['fecha_nacimiento']; ?></p>
            <p><strong>Dirección:</strong> <?php echo $consulta['direccion']; ?></p>
        </div>
    </div>


    <?php
}
?>