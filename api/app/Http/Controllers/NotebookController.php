<?php

namespace App\Http\Controllers;

use App\Models\Notebook;
use App\Models\UserNotebook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NotebookController extends Controller
{
    /**
     * Map of user-notebook flags to their timestamp columns.
     *
     * @var array<string, string>
     */
    private array $flagColumns = [
        'is_pinned_in_space' => 'pinned_in_space_at',
        'is_pinned_in_home' => 'pinned_in_home_at',
        'is_trashed' => 'trashed_at',
    ];

    /**
     * Return a paginated list of the authenticated user's notebooks
     * in a shape compatible with the frontend InfiniteQuery.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        $query = UserNotebook::query()
            ->select('user_notebook.*')
            ->with(['notebook'])
            ->where('user_notebook.user_id', $userId)
            ->leftJoin('notebooks', 'notebooks.id', '=', 'user_notebook.notebook_id');

        if ($request->filled('search')) {
            $term = $request->string('search')->toString();
            $query->where('notebooks.name', 'ILIKE', "%{$term}%");
        }

        foreach (array_keys($this->flagColumns) as $flagColumn) {
            if ($request->has($flagColumn)) {
                $value = filter_var(
                    $request->query($flagColumn),
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE
                );
                if ($value !== null) {
                    $query->where("user_notebook.{$flagColumn}", $value);
                }
            }
        }

        $sortBy = $request->string('sort_by')->toString();
        $sortDir = strtolower($request->string('sort_direction')->toString() ?: 'desc');
        $allowedSorts = [
            'updated_at' => 'user_notebook.updated_at',
            'created_at' => 'user_notebook.created_at',
        ];
        $sortColumn = $allowedSorts[$sortBy] ?? $allowedSorts['updated_at'];
        $direction = in_array($sortDir, ['asc', 'desc'], true) ? $sortDir : 'desc';
        $query->orderBy($sortColumn, $direction);

        $perPage = (int) ($request->integer('per_page') ?: 20);
        $perPage = max(1, min($perPage, 50));
        $page = (int) ($request->integer('page') ?: 1);

        $paginator = $query->paginate($perPage, ['user_notebook.*'], 'page', $page);

        return response()->json([
            'results' => $paginator->getCollection()->values(),
            'nextPage' => $paginator->currentPage() < $paginator->lastPage()
                ? $paginator->currentPage() + 1
                : null,
            'hasNextPage' => $paginator->hasMorePages(),
        ]);
    }

    /** Create a new notebook and attach it to the current user. */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'space_id' => ['sometimes', 'nullable', 'uuid', 'exists:spaces,id'],
            'is_pinned_in_space' => ['sometimes', 'boolean'],
            'is_pinned_in_home' => ['sometimes', 'boolean'],
            'is_trashed' => ['sometimes', 'boolean'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        $notebook = Notebook::create([
            'created_by_user_id' => Auth::id(),
            'name' => $validated['name'],
            'space_id' => $validated['space_id'] ?? null,
        ]);

        $createData = array_merge([
            'notebook_id' => $notebook->id,
            'user_id' => Auth::id(),
            'is_owner' => true,
            'is_default' => $validated['is_default'] ?? false,
        ], $this->buildFlagPayload($validated));

        $userNotebook = UserNotebook::create($createData);
        $userNotebook->load(['notebook']);

        return response()->json($userNotebook, 201);
    }

    /** Update an existing notebook (only if it belongs to the user). */
    public function update(Request $request, string $id)
    {
        $userNotebook = UserNotebook::with('notebook')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'space_id' => ['sometimes', 'nullable', 'uuid', 'exists:spaces,id'],
            'is_pinned_in_space' => ['sometimes', 'boolean'],
            'is_pinned_in_home' => ['sometimes', 'boolean'],
            'is_trashed' => ['sometimes', 'boolean'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('name', $validated)) {
            $userNotebook->notebook->update(['name' => $validated['name']]);
        }
        if (array_key_exists('space_id', $validated)) {
            $userNotebook->notebook->update(['space_id' => $validated['space_id']]);
        }

        $flagPayload = $this->buildFlagPayload($validated);
        if (array_key_exists('is_default', $validated)) {
            $flagPayload['is_default'] = (bool) $validated['is_default'];
        }
        if (!empty($flagPayload)) {
            $userNotebook->fill($flagPayload);
        }

        $userNotebook->save();
        $userNotebook->load(['notebook']);
        $userNotebook->touch();

        return response()->json($userNotebook);
    }

    /** Delete the link and the notebook (if this is the last owner). */
    public function destroy(string $id)
    {
        $userNotebook = UserNotebook::with('notebook')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        DB::transaction(function () use ($userNotebook) {
            $notebook = $userNotebook->notebook;
            $userNotebook->delete();

            $remaining = UserNotebook::where('notebook_id', $notebook->id)->exists();

            if (!$remaining) {
                $notebook->delete();
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
}
