<?php
/**
 * Create Room API
 * POST /create_room.php
 */

require_once 'config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

try {
    // Require authentication
    $user = requireAuth();
    
    // Get JSON input
    $input = getJSONInput();
    
    if (!$input) {
        sendResponse(['error' => 'Invalid JSON input'], 400);
    }
    
    // Validate required fields
    $required = ['name', 'subject'];
    $missing = validateRequired($input, $required);
    
    if (!empty($missing)) {
        sendResponse(['error' => 'Missing required fields: ' . implode(', ', $missing)], 400);
    }
    
    $name = trim($input['name']);
    $subject = trim($input['subject']);
    $description = isset($input['description']) ? trim($input['description']) : '';
    $max_participants = isset($input['max_participants']) ? (int)$input['max_participants'] : 50;
    
    // Validate input
    if (strlen($name) < 3 || strlen($name) > 100) {
        sendResponse(['error' => 'Room name must be between 3 and 100 characters'], 400);
    }
    
    if (strlen($subject) < 2 || strlen($subject) > 50) {
        sendResponse(['error' => 'Subject must be between 2 and 50 characters'], 400);
    }
    
    if ($max_participants < 2 || $max_participants > 100) {
        sendResponse(['error' => 'Max participants must be between 2 and 100'], 400);
    }
    
    // Connect to database
    $pdo = getDBConnection();
    
    // Check if room name already exists
    $stmt = $pdo->prepare("SELECT id FROM rooms WHERE name = ? AND is_active = 1");
    $stmt->execute([$name]);
    
    if ($stmt->fetch()) {
        sendResponse(['error' => 'Room name already exists'], 409);
    }
    
    // Insert new room
    $stmt = $pdo->prepare("INSERT INTO rooms (name, subject, description, created_by, max_participants) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $subject, $description, $user['user_id'], $max_participants]);
    
    $room_id = $pdo->lastInsertId();
    
    // Get the created room with creator info
    $stmt = $pdo->prepare("SELECT r.id, r.name, r.subject, r.description, r.created_at, r.max_participants, 
                                  u.username as created_by_username
                           FROM rooms r 
                           JOIN users u ON r.created_by = u.id 
                           WHERE r.id = ?");
    $stmt->execute([$room_id]);
    $room = $stmt->fetch();
    
    // Return success response
    sendResponse([
        'success' => true,
        'message' => 'Room created successfully',
        'room' => $room
    ], 201);
    
} catch (PDOException $e) {
    error_log("Create room error: " . $e->getMessage());
    sendResponse(['error' => 'Failed to create room'], 500);
} catch (Exception $e) {
    error_log("Create room error: " . $e->getMessage());
    sendResponse(['error' => 'An error occurred while creating room'], 500);
}
?>
