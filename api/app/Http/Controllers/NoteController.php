<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Note;
use Illuminate\Pagination\CursorPaginator;


class NoteController extends Controller
{
    public function index(Request $request)
{
    $query = Note::query();

    if ($request->has('tag')) {
        $query->where('tag_id', $request->get('tag'));
    }

    if ($request->has('notebook')) {
        $query->where('notebook_id', '<=', $request->get('notebook'));
    }


     if ($request->has('sort_by')) {
        $sortBy = $request->get('sort_by');
        $sortDirection = $request->get('sort_direction', 'asc');

        // Validate sort_by to prevent SQL injection
        $allowedSortColumns = ['title', 'updated_at', 'created_at'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDirection);
        }
    }



    if ($request->has('search')) {
        $searchTerm = '%' . $request->get('search') . '%';
        $query->where('title', 'like', $searchTerm)
              ->orWhere('content', 'like', $searchTerm);
    }


    $notes = $query->cursorPaginate(10);
    return response()->json($notes);
}
}
