<?php
/**
 * Get Rooms API
 * GET /get_rooms.php
 */

require_once 'config.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

try {
    // Connect to database
    $pdo = getDBConnection();
    
    // Get optional subject filter
    $subject = isset($_GET['subject']) ? trim($_GET['subject']) : null;
    
    // Build query
    $sql = "SELECT r.id, r.name, r.subject, r.description, r.created_at, r.max_participants, 
                   u.username as created_by_username
            FROM rooms r 
            JOIN users u ON r.created_by = u.id 
            WHERE r.is_active = 1";
    
    $params = [];
    
    if ($subject) {
        $sql .= " AND r.subject = ?";
        $params[] = $subject;
    }
    
    $sql .= " ORDER BY r.created_at DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rooms = $stmt->fetchAll();
    
    // Get unique subjects for filter options
    $stmt = $pdo->prepare("SELECT DISTINCT subject FROM rooms WHERE is_active = 1 ORDER BY subject");
    $stmt->execute();
    $subjects = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Return success response
    sendResponse([
        'success' => true,
        'rooms' => $rooms,
        'subjects' => $subjects,
        'total' => count($rooms)
    ]);
    
} catch (PDOException $e) {
    error_log("Get rooms error: " . $e->getMessage());
    sendResponse(['error' => 'Failed to fetch rooms'], 500);
} catch (Exception $e) {
    error_log("Get rooms error: " . $e->getMessage());
    sendResponse(['error' => 'An error occurred while fetching rooms'], 500);
}
?>
