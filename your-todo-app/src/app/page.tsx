"use client";

import { useEffect, useState } from "react";
import { getTodos, addTodo, toggleTodo } from "../../lib/todo";

export default function Home() {
  const [todos, setTodos] = useState<any[]>([]);
  const [title, setTitle] = useState("");

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
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded"
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
            <span className={todo.completed ? "line-through text-gray-500" : ""}>
              {todo.title}
            </span>
            <button
              onClick={() => handleToggle(todo.id, todo.completed)}
              className="text-sm bg-gray-200 px-2 py-1 rounded"
            >
              {todo.completed ? "Undo" : "Complete"}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
