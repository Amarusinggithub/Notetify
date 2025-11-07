<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LiveblocksController extends Controller
{
    /**
     * Exchange the authenticated user for a Liveblocks access token.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'room' => ['required', 'string', 'max:191'],
        ]);

        $user = $request->user();
        $secret = config('services.liveblocks.secret');
        $baseUri = rtrim(config('services.liveblocks.base_uri', 'https://api.liveblocks.io'), '/');

        if (!$secret) {
            abort(500, 'Liveblocks secret key is not configured.');
        }

        $response = Http::withToken($secret)
            ->acceptJson()
            ->post($baseUri . '/v2/authorize-user', [
                'userId' => (string) $user->getAuthIdentifier(),
                'permissions' => [
                    $validated['room'] => [
                        'room:write',
                        'room:read',
                        'room:presence:write',
                        'comments:write',
                        'comments:read',
                    ],
                ],
                'userInfo' => array_filter([
                    'name' => trim(collect([$user->first_name, $user->last_name])->filter()->implode(' ')) ?: null,
                    'email' => $user->email,
                    'avatar' => $user->profile_photo_url ?? null,
                ], fn ($value) => filled($value)),
            ]);

        if ($response->failed()) {
            return response()->json([
                'message' => 'Unable to authorize Liveblocks access.',
            ], $response->status());
        }

        return response()->json($response->json(), $response->status());
    }
}
