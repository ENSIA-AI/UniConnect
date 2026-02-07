
<?php
class Auth {
    private static $secretKey = "your-secret-key-change-this-in-production";
    
    public static function generateToken($userId, $email) {
        $payload = [
            'user_id' => $userId,
            'email' => $email,
            'exp' => time() + (86400 * 7) // 7 days
        ];
        
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secretKey, true);
        $base64UrlSignature = self::base64UrlEncode($signature);
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
    
    public static function validateToken($token) {
        if (!$token) {
            return false;
        }
        
        $tokenParts = explode('.', $token);
        if (count($tokenParts) !== 3) {
            return false;
        }
        
        list($header, $payload, $signature) = $tokenParts;
        
        $expectedSignature = hash_hmac('sha256', $header . "." . $payload, self::$secretKey, true);
        $expectedBase64UrlSignature = self::base64UrlEncode($expectedSignature);
        
        if ($signature !== $expectedBase64UrlSignature) {
            return false;
        }
        
        $payload = json_decode(self::base64UrlDecode($payload), true);
        
        if ($payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }
    
    public static function getCurrentUser() {
        $headers = getallheaders();
        $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
        
        if (!$token && isset($_COOKIE['auth_token'])) {
            $token = $_COOKIE['auth_token'];
        }
        
        return self::validateToken($token);
    }
    
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
    
    public static function requireAuth() {
        $user = self::getCurrentUser();
        if (!$user || !is_array($user)) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized - Invalid or expired token']);
            exit;
        }
        return $user;
    }
}
?>