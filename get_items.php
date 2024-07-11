<?php
// Database path
$db_path = 'main.db';

// Open the SQLite database
$db = new SQLite3($db_path);

// Query the data
$results = $db->query('SELECT nickname, profile_picture, price FROM item');

// Fetch all items
$items = [];
while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
    $items[] = $row;
}

// Return the items as JSON
header('Content-Type: application/json');
echo json_encode($items);
?>
