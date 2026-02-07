<?php
// Test API Response

echo "Testing API endpoints:\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/UniConnectBackend/lostandfound.php?status=lost");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "API Response Status: HTTP $http_code\n\n";

if ($response) {
    $data = json_decode($response, true);
    
    if (isset($data['data'])) {
        echo "✓ API returned data\n";
        echo "  Items count: " . $data['count'] . "\n";
        echo "  Status: " . $data['status'] . "\n\n";
        
        echo "First 3 items:\n";
        $count = 0;
        foreach ($data['data'] as $item) {
            if ($count >= 3) break;
            echo "  - ID: {$item['id']}, Title: {$item['title']}, Status: {$item['status']}\n";
            $count++;
        }
    } else {
        echo "✗ API did not return expected format\n";
        echo "Response: " . substr($response, 0, 200) . "\n";
    }
} else {
    echo "✗ No response from API\n";
}

echo "\n---\n\n";

// Test found items
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/UniConnectBackend/lostandfound.php?status=found");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);

$response = curl_exec($ch);
curl_close($ch);

if ($response) {
    $data = json_decode($response, true);
    echo "Found Items: " . $data['count'] . " items\n";
    if ($data['count'] > 0) {
        echo "  First item: " . $data['data'][0]['title'] . "\n";
    }
}
?>
