<?php
// Database path
$db_path = 'main.db';

// Open the SQLite database
$db = new SQLite3($db_path);

// Get the owner's nickname from the request
$owner = isset($_GET['owner']) ? $_GET['owner'] : '';

// Query the data
$statement = $db->prepare('SELECT nickname, profile_picture, price FROM item WHERE owner = :owner');
$statement->bindValue(':owner', $owner, SQLITE3_TEXT);
$results = $statement->execute();

// Fetch all items
$items = [];
while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
    $items[] = $row;
}

// Return the items as JSON
header('Content-Type: application/json');
echo json_encode($items);
?>
