<?php
header('Content-Type: application/json');

$botToken = '7404016461:AAGe2SQebaWxScSpI83LctL7AGg46qkihsY';
$channelUsername = '@friend_spot';

if (!isset($_GET['user_id'])) {
    echo json_encode(['error' => 'User ID not provided']);
    exit;
}

$userId = $_GET['user_id'];

// Check if the quest is already completed
$db = new SQLite3('main.db');
$stmt = $db->prepare('SELECT * FROM completed_quests WHERE user_id = :user_id AND quest_id = "telegram_subscribe"');
$stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
$result = $stmt->execute();

if ($result->fetchArray()) {
    echo json_encode(['subscribed' => true, 'already_claimed' => true]);
    exit;
}

$url = "https://api.telegram.org/bot$botToken/getChatMember?chat_id=$channelUsername&user_id=$userId";

$response = file_get_contents($url);
$result = json_decode($response, true);

$subscribed = false;
if ($result['ok'] && in_array($result['result']['status'], ['member', 'administrator', 'creator'])) {
    $subscribed = true;
}

echo json_encode(['subscribed' => $subscribed, 'already_claimed' => false]);
?>