<?php
header('Content-Type: application/json');
$path = __DIR__ . '/data.json';
if (!file_exists($path)) {
  echo json_encode([]);
  exit;
}
$data = file_get_contents($path);
echo $data;
