<?php
header('Content-Type: application/json');
$path = __DIR__ . '/data.json';
if (!file_exists($path)) {
  echo json_encode(['success' => false, 'message' => 'Data file not found']);
  exit;
}
$data = json_decode(file_get_contents($path), true);
$id = $_POST['id'] ?? null;
if (!$id) {
  echo json_encode(['success' => false, 'message' => 'Missing id']);
  exit;
}
$found = false;
foreach ($data as &$alumno) {
  if ($alumno['id'] == $id) {
    // actualizar campos si vienen
    foreach (['nombre','apellido','dni','direccion','fecha_nacimiento'] as $f) {
      if (isset($_POST[$f])) $alumno[$f] = $_POST[$f];
    }
    $found = true;
    break;
  }
}
if (!$found) {
  echo json_encode(['success' => false, 'message' => 'Alumno no encontrado']);
  exit;
}
file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo json_encode(['success' => true]);
