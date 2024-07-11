<?php
// Database path
$db_path = 'main.db';

try {
    // Open the SQLite database
    $db = new SQLite3($db_path);

    // Get the username from the request
    $username = isset($_GET['username']) ? $_GET['username'] : '';

    if (empty($username)) {
        throw new Exception('Username is required');
    }

    // Query the data
    $statement = $db->prepare('SELECT profile_picture FROM users WHERE username = :username');
    $statement->bindValue(':username', $username, SQLITE3_TEXT);
    $result = $statement->execute()->fetchArray(SQLITE3_ASSOC);

    if ($result) {
        $profile_picture = $result['profile_picture'];
    } else {
        throw new Exception('User not found');
    }

    // Return the profile picture as JSON
    header('Content-Type: application/json');
    echo json_encode(['profile_picture' => $profile_picture]);

} catch (Exception $e) {
    // Return error as JSON
    header('Content-Type: application/json', true, 500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
