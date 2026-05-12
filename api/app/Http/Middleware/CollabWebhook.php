<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CollabWebhook
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = config('services.collab.webhook_secret');

        if (!$expected || !hash_equals($expected, (string) $request->header('X-Collab-Secret', ''))) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
