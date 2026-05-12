<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;

class CollabController extends Controller
{
    public function token(Request $request, string $noteId)
    {
        $user = $request->user();
        $note = Note::findOrFail($noteId);
        $this->authorize('update', $note); // reuses existing Note policy

        $now = time();
        $payload = [
            'sub'    => (string) $user->id,
            'name'   => $user->name,
            'noteId' => (string) $note->id,
            'role'   => 'editor',
            'iat'    => $now,
            'exp'    => $now + (int) config('services.collab.ttl', 3600),
        ];

        return response()->json([
            'token'  => JWT::encode($payload, config('services.collab.secret'), 'HS256'),
            'wsUrl'  => config('services.collab.ws_url'),
            'docId'  => "note:{$note->id}",
        ]);
    }

    public function viewerToken(Request $request, string $noteId)
    {
        $user = $request->user();
        $note = Note::findOrFail($noteId);
        $this->authorize('view', $note); // read-only share check

        $now = time();
        $payload = [
            'sub'    => (string) $user->id,
            'name'   => $user->name,
            'noteId' => (string) $note->id,
            'role'   => 'viewer',  // Hocuspocus rejects writes for this role
            'iat'    => $now,
            'exp'    => $now + (int) config('services.collab.ttl', 3600),
        ];

        return response()->json([
            'token'  => JWT::encode($payload, config('services.collab.secret'), 'HS256'),
            'wsUrl'  => config('services.collab.ws_url'),
            'docId'  => "note:{$note->id}",
        ]);
    }
}
