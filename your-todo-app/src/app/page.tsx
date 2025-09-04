"use client";
import { useEffect, useState } from "react";
import { getTodos, addTodo, toggleTodo, saveAiOutput, deleteTodo } from '../../lib/todo';


type Todo = {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  enhanced_title?: string | null;
  ai_output?: string | null;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load todos on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await getTodos();
        setTodos(data as Todo[]);
      } catch (err) {
        setError("Failed to load todos");
        console.error(err);
      }
    }
    load();
  }, []);

  // Add Todo
  async function handleAdd() {
    if (!title) return;
    try {
      await addTodo(title, description || "");
      setTitle("");
      setDescription("");
      const data = await getTodos();
      setTodos(data as Todo[]);
    } catch (err) {
      setError("Failed to add todo");
      console.error(err);
    }
  }

  // Toggle Todo
  async function handleToggle(id: string, completed: boolean) {
    try {
      await toggleTodo(id, !completed);
      const data = await getTodos();
      setTodos(data as Todo[]);
    } catch (err) {
      setError("Failed to update todo");
      console.error(err);
    }
  }

  // Delete Todo
  async function handleDelete(id: string) {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError("Failed to delete todo");
      console.error(err);
    }
  }

  // Ask AI
  async function askAi(todo: Todo) {
    const userPrompt =
      prompt[todo.id] ||
      todo.description ||
      `Generate a detailed task output using only this title: ${todo.title}`;

    setLoadingId(todo.id);
    setError(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: todo.title,
          description: todo.description || "",
          prompt: userPrompt,
          todoId: todo.id,
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();

      if (data.enhancedTitle && data.enhancedTitle.includes("{$json")) {
        throw new Error("n8n returned template expressions instead of values");
      }

      await saveAiOutput(todo.id, data.enhancedTitle, data.output);
      const todosData = await getTodos();
      setTodos(todosData as Todo[]);
    } catch (err) {
      console.error("AI request failed:", err);
      setError(
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message)
          : "AI request failed. Check console for details."
      );
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">To-Do List with AI Helper</h1>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close-btn">
            ×
          </button>
        </div>
      )}

      {/* Add Task */}
      <div className="flex flex-col gap-2">
        <input
          className="task-input"
          placeholder="New task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="task-textarea"
          placeholder="Task description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleAdd} className="addbutton">
          Add
        </button>
      </div>

      {/* Tasks */}
      <ul className="tasks-list">
        {todos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <div className="todo-header">
              <span className={todo.completed ? "todo-text completed" : "todo-text"}>
                {todo.enhanced_title || todo.title}
              </span>
              <div className="flex gap-2">
                <button onClick={() => handleToggle(todo.id, todo.completed)} className="completebtn">
                  {todo.completed ? "Undo" : "Complete"}
                </button>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>

            {todo.enhanced_title && todo.enhanced_title !== todo.title && (
              <p className="original-todo">Original: {todo.title}</p>
            )}

            {/* AI Helper */}
            <div className="ai-helper">
              <textarea
                className="ai-textarea"
                placeholder="Ask AI for enhancement suggestions..."
                value={prompt[todo.id] || ""}
                onChange={(e) => setPrompt((p) => ({ ...p, [todo.id]: e.target.value }))}
              />
              <button
                onClick={() => askAi(todo)}
                disabled={loadingId === todo.id}
                className="ai-button"
              >
                {loadingId === todo.id ? "Thinking..." : "Ask AI"}
              </button>
            </div>

            {/* Show AI output */}
            {todo.ai_output && (
              <div className="ai-output">
                <div className="ai-output-header">
                  <span className="ai-output-title">AI Suggestions:</span>
                </div>
                {todo.ai_output}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
