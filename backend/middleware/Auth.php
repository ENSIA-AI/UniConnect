<?php
class Auth {
    private static $secretKey = "uniconnect-secret-key-2025-change-in-production";

    public static function generateToken($userId, $email) {
        $payload = ['user_id'=>$userId,'email'=>$email,'exp'=>time()+86400*7];
        $header = json_encode(['typ'=>'JWT','alg'=>'HS256']);
        $payload = json_encode($payload);

        $b64Header = self::base64UrlEncode($header);
        $b64Payload = self::base64UrlEncode($payload);
        $signature = hash_hmac('sha256', "$b64Header.$b64Payload", self::$secretKey, true);
        return "$b64Header.$b64Payload.".self::base64UrlEncode($signature);
    }

    public static function validateToken($token) {
        if (!$token) return false;
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;

        list($header, $payload, $signature) = $parts;
        $expected = self::base64UrlEncode(hash_hmac('sha256', "$header.$payload", self::$secretKey, true));
        if ($signature !== $expected) return false;

        $payloadData = json_decode(self::base64UrlDecode($payload), true);
        if ($payloadData['exp'] < time()) return false;
        return $payloadData;
    }

    public static function getCurrentUser() {
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? $_COOKIE['auth_token'] ?? null;
        if ($token && str_starts_with($token, 'Bearer ')) $token = substr($token, 7);
        return self::validateToken($token);
    }

    public static function requireAuth() {
        $user = self::getCurrentUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['message'=>'Unauthorized. Please login.']);
            exit;
        }
        return $user;
    }

    private static function base64UrlEncode($data) { return rtrim(strtr(base64_encode($data), '+/', '-_'), '='); }
    private static function base64UrlDecode($data) { return base64_decode(strtr($data, '-_', '+/')); }
}
?>
