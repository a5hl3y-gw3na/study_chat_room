 <?php
/**
 * User Login API
 * POST /login.php
 */

require_once 'config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

try {
    // Get JSON input
    $input = getJSONInput();
    
    if (!$input) {
        sendResponse(['error' => 'Invalid JSON input'], 400);
    }
    
    // Validate required fields
    $required = ['username', 'password'];
    $missing = validateRequired($input, $required);
    
    if (!empty($missing)) {
        sendResponse(['error' => 'Missing required fields: ' . implode(', ', $missing)], 400);
    }
    
    $username = trim($input['username']);
    $password = $input['password'];
    
    // Connect to database
    $pdo = getDBConnection();
    
    // Find user by username or email
    $stmt = $pdo->prepare("SELECT id, username, email, password_hash, is_active FROM users WHERE (username = ? OR email = ?) AND is_active = 1");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendResponse(['error' => 'Invalid credentials'], 401);
    }
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        sendResponse(['error' => 'Invalid credentials'], 401);
    }
    
    // Update last login
    $stmt = $pdo->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?");
    $stmt->execute([$user['id']]);
    
    // Generate JWT token
    $payload = [
        'user_id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ];
    
    $token = generateJWT($payload);
    
    // Return success response
    sendResponse([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email']
        ],
        'token' => $token
    ]);
    
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    sendResponse(['error' => 'Login failed'], 500);
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    sendResponse(['error' => 'An error occurred during login'], 500);
}
?>
