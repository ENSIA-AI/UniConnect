<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    */

    // Which paths should accept CORS requests
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Allowed HTTP methods
    'allowed_methods' => ['*'],

    // Allowed frontend origins
    'allowed_origins' => ['http://localhost:8000'],

    // Patterns for allowed origins
    'allowed_origins_patterns' => [],

    // Allowed headers
    'allowed_headers' => ['*'],

    // Headers exposed to the browser
    'exposed_headers' => [],

    // How long the results of a preflight request can be cached (in seconds)
    'max_age' => null, // use null to avoid array_merge errors

    // Whether cookies / credentials are supported
    'supports_credentials' => true,

];
