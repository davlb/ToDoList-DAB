"use client";

import { useEffect, useState } from "react";
import { getTodos, addTodo, toggleTodo, updateTodo } from "../../lib/todo";

export default function Home() {
  const [todos, setTodos] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Load tasks on first render
  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    const data = await getTodos();
    setTodos(data);
  }

  async function handleAdd() {
    if (!title) return;
    await addTodo(title);
    setTitle("");
    loadTodos();
  }

  async function handleToggle(id: string, completed: boolean) {
    await toggleTodo(id, !completed);
    loadTodos();
  }

  function startEdit(todo: any) {
    setEditingId(todo.id);
    setEditText(todo.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  async function saveEdit(id: string) {
    if (!editText.trim()) {
      cancelEdit();
      return;
    }
    
    await updateTodo(id, editText);
    setEditingId(null);
    setEditText("");
    loadTodos();
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">To-Do List</h1>

      {/* Input + Add button */}
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-grow rounded"
          placeholder="New task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="addbutton"
        >
          Add
        </button>
      </div>

      {/* Task list */}
      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex justify-between items-center border-b py-2"
          >
            {/* Edit mode or display mode */}
            {editingId === todo.id ? (
              <div className="flex-grow flex gap-2">
                <input
                  className="border p-1 flex-grow rounded"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(todo.id);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  autoFocus
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => saveEdit(todo.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className={todo.completed ? "line-through text-gray-500" : ""}>
                  {todo.title}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(todo)}
                    className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggle(todo.id, todo.completed)}
                    className="completebtn"
                  >
                    {todo.completed ? "Undo" : "Complete"}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      
      {/* Add some styles for the buttons */}
      <style jsx>{`
        .addbutton {
          background-color: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          transition: background-color 0.2s;
        }
        .addbutton:hover {
          background-color: #2563eb;
        }
        .completebtn {
          background-color: #e5e7eb;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }
        .completebtn:hover {
          background-color: #d1d5db;
        }
      `}</style>
    </main>
  );
}