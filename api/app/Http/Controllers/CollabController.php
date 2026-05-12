<?php

namespace App\Http\Controllers;

use App\Models\UserNote;
use Firebase\JWT\JWT;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CollabController extends Controller
{
    public function token(Request $request, string $noteId)
    {
        $user = $request->user();
        $userNote = UserNote::where('id', $noteId)->where('user_id', $user->id)->firstOrFail();
        $note = $userNote->note;

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
        $userNote = UserNote::where('id', $noteId)->where('user_id', $user->id)->firstOrFail();
        $note = $userNote->note;

        $now = time();
        $payload = [
            'sub'    => (string) $user->id,
            'name'   => $user->name,
            'noteId' => (string) $note->id,
            'role'   => 'viewer',
            'iat'    => $now,
            'exp'    => $now + (int) config('services.collab.ttl', 3600),
        ];

        return response()->json([
            'token'  => JWT::encode($payload, config('services.collab.secret'), 'HS256'),
            'wsUrl'  => config('services.collab.ws_url'),
            'docId'  => "note:{$note->id}",
        ]);
    }

    /**
     * Hocuspocus onLoadDocument — return the persisted Y.Doc state for a note.
     * ydoc_state is BYTEA; encode to base64 for transport.
     */
    public function load(string $note): JsonResponse
    {
        $row = DB::selectOne(
            "SELECT encode(ydoc_state, 'base64') AS ydoc_state FROM notes WHERE id = ? AND deleted_at IS NULL",
            [$note]
        );

        if ($row === null) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $ydocState = $row->ydoc_state !== null
            ? str_replace("\n", '', $row->ydoc_state)
            : null;

        return response()->json(['ydocState' => $ydocState]);
    }

    /**
     * Hocuspocus onStoreDocument — persist Y.Doc binary state + derived JSON content.
     * ydoc_state is BYTEA; decode from base64 using Postgres decode().
     */
    public function store(Request $request, string $note): JsonResponse
    {
        $validated = $request->validate([
            'ydocState' => ['required', 'string'],
            'content'   => ['required', 'array'],
        ]);

        $affected = DB::statement(
            "UPDATE notes SET ydoc_state = decode(?, 'base64'), content = ?::jsonb, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL",
            [$validated['ydocState'], json_encode($validated['content']), $note]
        );

        if (!$affected) {
            return response()->json(['error' => 'Not found'], 404);
        }

        // Bubble updated_at up to all user_note rows so list queries see the change.
        UserNote::where('note_id', $note)->update(['updated_at' => now()]);

        return response()->json(['ok' => true]);
    }
}
