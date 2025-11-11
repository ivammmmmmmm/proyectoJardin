<?php
header('Content-Type: application/json');
$path = __DIR__ . '/data.json';
if (!file_exists($path)) {
  echo json_encode(['success' => false, 'message' => 'Data file not found']);
  exit;
}
$id = $_GET['id'] ?? null;
if (!$id) {
  echo json_encode(['success' => false, 'message' => 'Missing id']);
  exit;
}
$data = json_decode(file_get_contents($path), true);
$new = [];
$found = false;
foreach ($data as $alumno) {
  if ($alumno['id'] == $id) { $found = true; continue; }
  $new[] = $alumno;
}
if (!$found) {
  echo json_encode(['success' => false, 'message' => 'Alumno no encontrado']);
  exit;
}
file_put_contents($path, json_encode($new, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo json_encode(['success' => true]);
