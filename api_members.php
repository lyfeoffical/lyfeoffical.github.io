<?php
/**
 * LYFESTYLE - Members API Endpoint
 * GET: à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸¡à¸²à¸Šà¸´à¸à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” (JSON)
 * POST: à¸šà¸±à¸™à¸—à¸¶à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸¡à¸²à¸Šà¸´à¸ (à¸ªà¸³à¸«à¸£à¸±à¸šà¸£à¸°à¸šà¸š Admin à¸«à¸£à¸·à¸­ Sync)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = __DIR__ . '/members_data.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $decoded = json_decode($input, true);
    if (is_array($decoded) && count($decoded) > 0) {
        file_put_contents($dataFile, json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        // Sync members.js
        $jsCode = "const members = " . json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";\n";
        file_put_contents(__DIR__ . '/members.js', $jsCode);
        echo json_encode(['success' => true, 'count' => count($decoded)]);
        exit;
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid data format']);
        exit;
    }
}

// GET method
if (file_exists($dataFile)) {
    $data = file_get_contents($dataFile);
    echo $data;
} else {
    echo json_encode([]);
}