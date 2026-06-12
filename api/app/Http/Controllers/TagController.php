<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TagController extends Controller
{
    /**
     * Return a paginated list of the authenticated user's tags
     * in a shape compatible with the frontend InfiniteQuery.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        $query = Tag::query()->where('user_id', $userId);

        if ($request->filled('search')) {
            $term = $request->string('search')->toString();
            $query->where('name', 'ILIKE', "%{$term}%");
        }

        $sortBy = $request->string('sort_by')->toString();
        $sortDir = strtolower($request->string('sort_direction')->toString() ?: 'desc');
        $allowedSorts = [
            'updated_at' => 'updated_at',
            'created_at' => 'created_at',
            'order' => 'order',
        ];
        $sortColumn = $allowedSorts[$sortBy] ?? $allowedSorts['updated_at'];
        $direction = in_array($sortDir, ['asc', 'desc'], true) ? $sortDir : 'desc';
        $query->orderBy($sortColumn, $direction);

        $perPage = (int) ($request->integer('per_page') ?: 20);
        $perPage = max(1, min($perPage, 50));
        $page = (int) ($request->integer('page') ?: 1);

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'results' => $paginator->getCollection()->values(),
            'nextPage' => $paginator->currentPage() < $paginator->lastPage()
                ? $paginator->currentPage() + 1
                : null,
            'hasNextPage' => $paginator->hasMorePages(),
        ]);
    }

    /** Create a tag owned by the current user. */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'color' => ['sometimes', 'nullable', 'string', 'max:32'],
            'order' => ['sometimes', 'nullable', 'integer'],
        ]);

        $tag = Tag::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'color' => $validated['color'] ?? null,
            'order' => $validated['order'] ?? null,
        ]);

        return response()->json($tag, 201);
    }

    /** Update one of the user's tags (name, color, order). */
    public function update(Request $request, string $id)
    {
        $tag = Tag::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'color' => ['sometimes', 'nullable', 'string', 'max:32'],
            'order' => ['sometimes', 'nullable', 'integer'],
        ]);

        $tag->fill($validated);
        $tag->save();

        return response()->json($tag);
    }

    /** Delete one of the user's tags (note links cascade via user_note_tag). */
    public function destroy(string $id)
    {
        $tag = Tag::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $tag->delete();

        return response()->json(['status' => 'deleted']);
    }
}
