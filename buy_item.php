<?php
// Database path
$db_path = 'main.db';

try {
    // Open the SQLite database
    $db = new SQLite3($db_path);

    // Get the data from the request
    $nickname = isset($_POST['nickname']) ? $_POST['nickname'] : '';
    $new_owner = isset($_POST['new_owner']) ? $_POST['new_owner'] : '';

    if (empty($nickname) || empty($new_owner)) {
        throw new Exception('Nickname and new owner are required');
    }

    // Begin a transaction
    $db->exec('BEGIN');

    // Get the current price
    $statement = $db->prepare('SELECT price FROM item WHERE nickname = :nickname');
    $statement->bindValue(':nickname', $nickname, SQLITE3_TEXT);
    $result = $statement->execute()->fetchArray(SQLITE3_ASSOC);

    if ($result) {
        $current_price = $result['price'];
        $new_price = $current_price * 1.20; // Increase price by 20%
    } else {
        throw new Exception('Item not found');
    }

    // Update the owner and price
    $statement = $db->prepare('UPDATE item SET owner = :new_owner, price = :new_price WHERE nickname = :nickname');
    $statement->bindValue(':new_owner', $new_owner, SQLITE3_TEXT);
    $statement->bindValue(':new_price', $new_price, SQLITE3_FLOAT);
    $statement->bindValue(':nickname', $nickname, SQLITE3_TEXT);
    $statement->execute();

    // Commit the transaction
    $db->exec('COMMIT');

    // Return success message
    header('Content-Type: application/json');
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    // Rollback the transaction on error
    $db->exec('ROLLBACK');

    // Return error as JSON
    header('Content-Type: application/json', true, 500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
