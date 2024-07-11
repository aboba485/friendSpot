<?php
header('Content-Type: application/json');

if (!isset($_POST['user_id']) || !isset($_POST['quest_id'])) {
    echo json_encode(['error' => 'User ID or Quest ID not provided']);
    exit;
}

$userId = $_POST['user_id'];
$questId = $_POST['quest_id'];

$db = new SQLite3('main.db');

// Check if the quest is already completed
$stmt = $db->prepare('SELECT * FROM completed_quests WHERE user_id = :user_id AND quest_id = :quest_id');
$stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
$stmt->bindValue(':quest_id', $questId, SQLITE3_TEXT);
$result = $stmt->execute();

if ($result->fetchArray()) {
    echo json_encode(['success' => false, 'message' => 'Prize already claimed']);
    exit;
}

// Insert the completed quest
$stmt = $db->prepare('INSERT INTO completed_quests (user_id, quest_id) VALUES (:user_id, :quest_id)');
$stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
$stmt->bindValue(':quest_id', $questId, SQLITE3_TEXT);
$stmt->execute();

$prizes = ['NFT', 'TON'];
$randomPrize = $prizes[array_rand($prizes)];

echo json_encode(['success' => true, 'prize' => $randomPrize]);
?>