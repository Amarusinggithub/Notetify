<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\UserNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NoteController extends Controller
{
    /**
     * Return a paginated list of the authenticated user's notes
     * in a shape compatible with the frontend InfiniteQuery:
     * {
     *   results: UserNote[],
     *   nextPage: int|null,
     *   hasNextPage: bool
     * }
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        $query = UserNote::with(['note'])
            ->where('user_id', $userId)
            ->orderByDesc('updated_at');

        // Optional search against the related note title/content
        if ($request->filled('search')) {
            $search = '%' . $request->string('search')->toString() . '%';
            $query->whereHas('note', function ($q) use ($search) {
                $q->where('title', 'like', $search)
                  ->orWhere('content', 'like', $search);
            });
        }

        // Optional boolean filters on user-note flags
        $boolFilters = [
            'is_favorited' => 'is_favorited',
            'is_trashed' => 'is_trashed',
            'is_pinned' => 'is_pinned',
        ];
        foreach ($boolFilters as $param => $column) {
            if ($request->has($param)) {
                $value = filter_var($request->query($param), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($value !== null) {
                    $query->where($column, $value);
                }
            }
        }

        // Optional sorting; allow only a limited set of columns
        $allowedSortColumns = ['created_at', 'updated_at'];
        $sortBy = $request->string('sort_by')->toString();
        $sortDir = $request->string('sort_direction')->toString() ?: 'desc';
        if ($sortBy && in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, in_array(strtolower($sortDir), ['asc', 'desc']) ? $sortDir : 'desc');
        }

        $perPage = (int) ($request->integer('per_page') ?: 10);
        $page = (int) ($request->integer('page') ?: 1);
        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'results' => $paginator->items(),
            'nextPage' => $paginator->currentPage() < $paginator->lastPage()
                ? $paginator->currentPage() + 1
                : null,
            'hasNextPage' => $paginator->hasMorePages(),
        ]);
    }

    /** Create a new note and attach to current user */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
        ]);

        $note = Note::create([
            'title' => $validated['title'],
            'content' => $validated['content'] ?? '',
        ]);

        $userNote = UserNote::create([
            'note_id' => $note->id,
            'user_id' => Auth::id(),
            'is_favorited' => false,
            'is_pinned' => false,
            'is_trashed' => false,
        ]);

        $userNote->load('note');
        return response()->json($userNote, 201);
    }

    /** Update an existing note (only if it belongs to the user) */
    public function update(Request $request, string $id)
    {
        $userNote = UserNote::with('note')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string', 'nullable'],
            'is_favorited' => ['sometimes', 'boolean'],
            'is_pinned' => ['sometimes', 'boolean'],
            'is_trashed' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('title', $validated) || array_key_exists('content', $validated)) {
            $userNote->note->fill([
                'title' => $validated['title'] ?? $userNote->note->title,
                'content' => $validated['content'] ?? $userNote->note->content,
            ])->save();
        }

        $userNote->fill($validated)->save();
        $userNote->load('note');

        return response()->json($userNote);
    }

    /** Soft delete the link and the note (if this is the last owner) */
    public function destroy(string $id)
    {
        $userNote = UserNote::with('note')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $note = $userNote->note;
        $userNote->delete();

        // If no other users are linked to this note, delete the note itself
        $remaining = UserNote::where('note_id', $note->id)->exists();
        if (!$remaining) {
            $note->delete();
        }

        return response()->json(['status' => 'deleted']);
    }
}
