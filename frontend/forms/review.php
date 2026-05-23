<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Function to send JSON response
function sendResponse($success, $message, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Only POST requests are allowed');
}

// Get form data
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$rating = isset($_POST['rating']) ? (int)$_POST['rating'] : 0;
$review = isset($_POST['review']) ? trim($_POST['review']) : '';

// Basic validation
if (empty($name)) {
    sendResponse(false, 'Name is required');
}

if ($rating < 1 || $rating > 5) {
    sendResponse(false, 'Rating must be between 1 and 5');
}

if (empty($review)) {
    sendResponse(false, 'Review text is required');
}

// Prepare data to send to Node.js API
$apiData = [
    'name' => $name,
    'rating' => $rating,
    'review' => $review
];

// Node.js API endpoint
$apiUrl = 'http://localhost:8000/api/reviews';

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($apiData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen(json_encode($apiData))
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Handle cURL errors
if ($curlError) {
    sendResponse(false, 'Failed to connect to the server: ' . $curlError);
}

// Handle HTTP errors
if ($httpCode >= 400) {
    $errorData = json_decode($response, true);
    $errorMessage = isset($errorData['message']) ? $errorData['message'] : 'Server error occurred';
    sendResponse(false, $errorMessage);
}

// Parse the API response
$apiResponse = json_decode($response, true);

if ($apiResponse === null) {
    sendResponse(false, 'Invalid response from server');
}

// Return the API response
if (isset($apiResponse['success']) && $apiResponse['success']) {
    sendResponse(true, $apiResponse['message'], $apiResponse['data'] ?? null);
} else {
    $message = isset($apiResponse['message']) ? $apiResponse['message'] : 'Unknown error occurred';
    sendResponse(false, $message);
}
?>