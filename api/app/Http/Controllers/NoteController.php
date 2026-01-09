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
        'is_pinned' => 'pinned_at',
        'is_trashed' => 'trashed_at',
    ];


    /**
     * Returns a single note
     */

    public function show(string $id)
    {
        $userNote= UserNote::with('note.tags')
        ->where('id', $id)
        ->where('user_id',Auth::id())
        ->firstOrFail();

        return response()->json($userNote);
    }

    /**
     * Return a paginated list of the authenticated user's notes
     * in a shape compatible with the frontend InfiniteQuery.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        $query = UserNote::query()
            ->select('user_note.*')
            ->with(['note.tags'])
            ->where('user_note.user_id', $userId)
            ->leftJoin('notes', 'notes.id', '=', 'user_note.note_id');

        if ($request->filled('tag')) {
            $tagName = $request->string('tag')->toString();

            // "Give me UserNotes where the related 'note' has a 'tag' with this name"
            $query->whereHas('note.tags', function ($q) use ($tagName) {
                $q->where('name', $tagName);
            });
        }

        if ($request->filled('search')) {
            $search = '%' . $request->string('search')->toString() . '%';
            $query->where(function ($builder) use ($search) {
                $builder->where('notes.content', 'like', $search);
            });
        }

        foreach (array_keys($this->flagColumns) as $flagColumn) {
            if ($request->has($flagColumn)) {
                $value = filter_var(
                    $request->query($flagColumn),
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE
                );
                if ($value !== null) {
                    $query->where("user_note.{$flagColumn}", $value);
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
            'is_pinned' => ['sometimes', 'boolean'],
            'is_trashed' => ['sometimes', 'boolean'],
        ]);

        $tags = $validated['tags'] ?? [];
        unset($validated['tags']);

        $note = Note::create([
            'content' => $validated['content'] ?? '',
        ]);

        $userNote = UserNote::create(array_merge([
            'note_id' => $note->id,
            'user_id' => Auth::id(),
        ], $this->buildFlagPayload($validated)));

        if (!empty($tags)) {
            $this->syncTags($note, $tags);
        }

            $userNote->load(['note.tags']);
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
            'content' => ['sometimes', 'string', 'nullable'],
            'is_pinned' => ['sometimes', 'boolean'],
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

        if (array_key_exists('tags', $validated)) {
            $this->syncTags($userNote->note, $validated['tags']);
        }

        $userNote->save();
        $userNote->load('note.tags');

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
     * Helper to find/create tags and sync them to the note.
     * This handles both adding new tags and removing omitted ones.
     */
    private function syncTags(Note $note, array $tagNames): void
    {
        $tagIds = [];
        foreach ($tagNames as $name) {
            // Find the tag by name, or create it if it doesn't exist
            $tag = Tag::firstOrCreate(['name' => $name]);
            $tagIds[] = $tag->id;
        }

        // sync() removes any IDs not in $tagIds, and adds the new ones
        $note->tags()->sync($tagIds);
    }
}
