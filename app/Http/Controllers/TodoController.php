<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TodoController extends Controller
{
    public function index(Request $request)
    {
        $query = Todo::where('user_id', auth()->id());

        // Pencarian
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Filter Status
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        // Filter Priority
        if ($request->has('priority') && $request->priority != '') {
            $query->where('priority', $request->priority);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $todos = $query->paginate(20)->withQueryString();

        // Statistik
        $statistics = [
            'total' => Todo::where('user_id', auth()->id())->count(),
            'completed' => Todo::where('user_id', auth()->id())->where('status', 'completed')->count(),
            'in_progress' => Todo::where('user_id', auth()->id())->where('status', 'in_progress')->count(),
            'pending' => Todo::where('user_id', auth()->id())->where('status', 'pending')->count(),
            'high_priority' => Todo::where('user_id', auth()->id())->where('priority', 'high')->count(),
            'medium_priority' => Todo::where('user_id', auth()->id())->where('priority', 'medium')->count(),
            'low_priority' => Todo::where('user_id', auth()->id())->where('priority', 'low')->count(),
        ];

        return Inertia::render('Todos/Index', [
            'todos' => $todos,
            'statistics' => $statistics,
            'filters' => $request->only(['search', 'status', 'priority', 'sort_by', 'sort_order'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,in_progress,completed',
            'priority' => 'required|in:low,medium,high',
            'due_date' => 'nullable|date',
            'cover' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $validated['user_id'] = auth()->id();

        if ($request->hasFile('cover')) {
            $validated['cover'] = $request->file('cover')->store('covers', 'public');
        }

        Todo::create($validated);

        return redirect()->back()->with('success', 'Todo berhasil ditambahkan!');
    }

    public function update(Request $request, Todo $todo)
    {
        // Pastikan user hanya bisa update todo miliknya
        if ($todo->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,in_progress,completed',
            'priority' => 'required|in:low,medium,high',
            'due_date' => 'nullable|date'
        ]);

        $todo->update($validated);

        return redirect()->back()->with('success', 'Todo berhasil diperbarui!');
    }

    public function updateCover(Request $request, Todo $todo)
    {
        if ($todo->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'cover' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        // Hapus cover lama
        if ($todo->cover) {
            Storage::disk('public')->delete($todo->cover);
        }

        $coverPath = $request->file('cover')->store('covers', 'public');
        $todo->update(['cover' => $coverPath]);

        return redirect()->back()->with('success', 'Cover berhasil diperbarui!');
    }

    public function destroy(Todo $todo)
    {
        if ($todo->user_id !== auth()->id()) {
            abort(403);
        }

        // Hapus cover jika ada
        if ($todo->cover) {
            Storage::disk('public')->delete($todo->cover);
        }

        $todo->delete();

        return redirect()->back()->with('success', 'Todo berhasil dihapus!');
    }
}