<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Tag;
use App\Models\UserNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NoteController extends Controller
{
    /**
     * Map of user-note flags to their timestamp columns.
     *
     * @var array<string, string>
     */
    private array $flagColumns = [
        'is_pinned_to_home' => 'pinned_to_home_at',
        'is_pinned_to_notebook' => 'pinned_to_notebook_at',
        'is_pinned_to_space' => 'pinned_to_space_at',
        'is_trashed' => 'trashed_at',
    ];


    /**
     * Returns a single note
     */

    public function show(string $id)
    {
        $userNote = UserNote::with(['note', 'tags'])
            ->where('id', $id)
            ->forUser(Auth::id())
            ->firstOrFail();

        return response()->json($userNote);
    }

    /**
     * Return a paginated list of the authenticated user's notes
     * in a shape compatible with the frontend InfiniteQuery.
     */
    public function index(Request $request)
    {
        // Build query using scopes - much cleaner than inline where() calls!
        // Scopes are defined in the UserNote model (see scopeForUser, scopeWithTag, etc.)
        $query = UserNote::query()
            ->select('user_note.*')
            ->with(['note', 'tags'])
            ->forUser(Auth::id())
            ->leftJoin('notes', 'notes.id', '=', 'user_note.note_id');

        if ($request->filled('tag')) {
            $query->withTag($request->string('tag')->toString());
        }

        if ($request->filled('search')) {
            $query->search($request->string('search')->toString());
        }

        if ($request->filled('notebook_id')) {
            $query->inNotebook($request->string('notebook_id')->toString());
        }

        // Apply flag filters using the whereFlag scope
        foreach (array_keys($this->flagColumns) as $flagColumn) {
            if ($request->has($flagColumn)) {
                $value = filter_var(
                    $request->query($flagColumn),
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE
                );
                if ($value !== null) {
                    $query->whereFlag($flagColumn, $value);
                }
            }
        }

        $sortBy = $request->string('sort_by')->toString();
        $sortDir = strtolower($request->string('sort_direction')->toString() ?: 'desc');
        $allowedSorts = [
            'updated_at' => 'user_note.updated_at',
            'created_at' => 'user_note.created_at',
        ];
        $sortColumn = $allowedSorts[$sortBy] ?? $allowedSorts['updated_at'];
        $direction = in_array($sortDir, ['asc', 'desc'], true) ? $sortDir : 'desc';
        $query->orderBy($sortColumn, $direction);

        $perPage = (int) ($request->integer('per_page') ?: 20);
        $perPage = max(1, min($perPage, 50));
        $page = (int) ($request->integer('page') ?: 1);

        $paginator = $query->paginate($perPage, ['user_note.*'], 'page', $page);

        return response()->json([
            'results' => $paginator->getCollection()->values(),
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
            'content' => ['nullable', 'string'],
            'tags' => ['sometimes', 'array'],
            'notebook_id' => ['sometimes', 'nullable', 'uuid', 'exists:notebooks,id'],
            'space_id' => ['sometimes', 'nullable', 'uuid', 'exists:spaces,id'],
            'is_pinned_to_home' => ['sometimes', 'boolean'],
            'is_pinned_to_notebook' => ['sometimes', 'boolean'],
            'is_pinned_to_space' => ['sometimes', 'boolean'],
            'is_trashed' => ['sometimes', 'boolean'],
        ]);

        $tags = $validated['tags'] ?? [];
        unset($validated['tags']);

        $note = Note::create([
            'content' => $validated['content'] ?? '',
        ]);

        $createData = array_merge([
            'note_id' => $note->id,
            'user_id' => Auth::id(),
            'notebook_id' => $validated['notebook_id'] ?? null,
            'space_id' => $validated['space_id'] ?? null,
        ], $this->buildFlagPayload($validated));

        // Handle added_at timestamps
        if (!empty($validated['notebook_id'])) {
            $createData['added_to_notebook_at'] = now();
        }
        if (!empty($validated['space_id'])) {
            $createData['added_to_space_at'] = now();
        }

        $userNote = UserNote::create($createData);

        if (!empty($tags)) {
            $this->syncTags($userNote, $tags);
        }

        $userNote->load(['note', 'tags']);
        return response()->json($userNote, 201);
    }

    /** Update an existing note (only if it belongs to the user) */
    public function update(Request $request, string $id)
    {
        $userNote = UserNote::with('note')
            ->where('id', $id)
            ->forUser(Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'content' => ['sometimes', 'string', 'nullable'],
            'notebook_id' => ['sometimes', 'nullable', 'uuid', 'exists:notebooks,id'],
            'space_id' => ['sometimes', 'nullable', 'uuid', 'exists:spaces,id'],
            'is_pinned_to_home' => ['sometimes', 'boolean'],
            'is_pinned_to_notebook' => ['sometimes', 'boolean'],
            'is_pinned_to_space' => ['sometimes', 'boolean'],
            'is_trashed' => ['sometimes', 'boolean'],
        ]);

        $notePayload = [];

        if (array_key_exists('content', $validated)) {
            $notePayload['content'] = $validated['content'] ?? '';
        }
        if (!empty($notePayload)) {
            $userNote->note->fill($notePayload)->save();
        }

        $flagPayload = $this->buildFlagPayload($validated);
        if (!empty($flagPayload)) {
            $userNote->fill($flagPayload);
        }

        if (array_key_exists('notebook_id', $validated)) {
            if ($userNote->notebook_id !== $validated['notebook_id']) {
                 $userNote->notebook_id = $validated['notebook_id'];
                 if ($validated['notebook_id']) {
                     $userNote->added_to_notebook_at = now();
                 } else {
                     $userNote->added_to_notebook_at = null;
                 }
            }
        }

        if (array_key_exists('space_id', $validated)) {
             if ($userNote->space_id !== $validated['space_id']) {
                 $userNote->space_id = $validated['space_id'];
                 if ($validated['space_id']) {
                     $userNote->added_to_space_at = now();
                 } else {
                     $userNote->added_to_space_at = null;
                 }
            }
        }

        if (array_key_exists('tags', $validated)) {
            $this->syncTags($userNote, $validated['tags']);
        }

        $userNote->save();
        $userNote->load(['note', 'tags']);
        $userNote->touch();

        return response()->json($userNote);
    }

    /** Soft delete the link and the note (if this is the last owner) */
    public function destroy(string $id)
    {
        $userNote = UserNote::with('note')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        DB::transaction(function () use ($userNote) {
            $note = $userNote->note;
            $userNote->delete();

            $remaining = UserNote::where('note_id', $note->id)->exists();

            if (!$remaining) {
                $note->delete();
            }
        });

        return response()->json(['status' => 'deleted']);
    }

    /**
     * Build the payload used to update boolean flags and their timestamps.
     *
     * @param  array<string, mixed>  $input
     */
    private function buildFlagPayload(array $input): array
    {
        $payload = [];

        foreach ($this->flagColumns as $flag => $timestampColumn) {
            if (array_key_exists($flag, $input)) {
                $value = (bool) $input[$flag];
                $payload[$flag] = $value;
                $payload[$timestampColumn] = $value ? now() : null;
            }
        }

        return $payload;
    }


    /**
     * Helper to find/create tags and sync them to the user note.
     * This handles both adding new tags and removing omitted ones.
     */
    private function syncTags(UserNote $userNote, array $tagNames): void
    {
        $tagIds = [];
        foreach ($tagNames as $name) {
            // Find the tag by name, or create it if it doesn't exist
            $tag = Tag::firstOrCreate(['name' => $name]);
            $tagIds[] = $tag->id;
        }

        // sync() removes any IDs not in $tagIds, and adds the new ones
        $userNote->tags()->sync($tagIds);
    }
}
