 <?php
/**
 * User Registration API
 * POST /register.php
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
    $required = ['username', 'email', 'password'];
    $missing = validateRequired($input, $required);
    
    if (!empty($missing)) {
        sendResponse(['error' => 'Missing required fields: ' . implode(', ', $missing)], 400);
    }
    
    $username = trim($input['username']);
    $email = trim($input['email']);
    $password = $input['password'];
    
    // Validate input
    if (strlen($username) < 3 || strlen($username) > 50) {
        sendResponse(['error' => 'Username must be between 3 and 50 characters'], 400);
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendResponse(['error' => 'Invalid email format'], 400);
    }
    
    if (strlen($password) < 6) {
        sendResponse(['error' => 'Password must be at least 6 characters long'], 400);
    }
    
    // Connect to database
    $pdo = getDBConnection();
    
    // Check if username or email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    
    if ($stmt->fetch()) {
        sendResponse(['error' => 'Username or email already exists'], 409);
    }
    
    // Hash password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$username, $email, $password_hash]);
    
    $user_id = $pdo->lastInsertId();
    
    // Generate JWT token
    $payload = [
        'user_id' => $user_id,
        'username' => $username,
        'email' => $email,
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ];
    
    $token = generateJWT($payload);
    
    // Return success response
    sendResponse([
        'success' => true,
        'message' => 'User registered successfully',
        'user' => [
            'id' => $user_id,
            'username' => $username,
            'email' => $email
        ],
        'token' => $token
    ], 201);
    
} catch (PDOException $e) {
    error_log("Registration error: " . $e->getMessage());
    sendResponse(['error' => 'Registration failed'], 500);
} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    sendResponse(['error' => 'An error occurred during registration'], 500);
}
?>
