"use client";

import { useState, useEffect, useRef } from "react";
import type { Todo } from "@/types/todo";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("todos");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, mounted]);

  const addTodo = () => {
    const text = inputText.trim();
    if (!text) return;
    setTodos((prev) => [
      { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() },
      ...prev,
    ]);
    setInputText("");
    inputRef.current?.focus();
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const doneCount = todos.filter((t) => t.completed).length;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            ToDo
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {activeCount > 0
              ? `残り ${activeCount} 件のタスク`
              : doneCount > 0
              ? "すべて完了しました！"
              : "タスクを追加してください"}
          </p>
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
          <button
            onClick={addTodo}
            disabled={!inputText.trim()}
            className="px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            追加
          </button>
        </div>

        {/* Filter tabs */}
        {todos.length > 0 && (
          <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl">
            {(["all", "active", "done"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filter === f
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了済み"}
              </button>
            ))}
          </div>
        )}

        {/* Todo list */}
        <div className="space-y-2">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-12 text-gray-300 text-sm">
              {filter === "done" ? "完了したタスクはありません" : filter === "active" ? "未完了のタスクはありません" : "タスクがありません"}
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`group flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border transition-all ${
                  todo.completed
                    ? "border-gray-100 opacity-60"
                    : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed
                      ? "bg-gray-900 border-gray-900"
                      : "border-gray-300 hover:border-gray-900"
                  }`}
                  aria-label={todo.completed ? "未完了に戻す" : "完了にする"}
                >
                  {todo.completed && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      viewBox="0 0 12 12"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2 6l3 3 5-5"
                      />
                    </svg>
                  )}
                </button>

                {/* Text */}
                <span
                  className={`flex-1 text-sm leading-relaxed ${
                    todo.completed ? "line-through text-gray-400" : "text-gray-800"
                  }`}
                >
                  {todo.text}
                </span>

                {/* Delete button */}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                  aria-label="削除"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 16 16"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      d="M4 4l8 8M12 4l-8 8"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer - clear completed */}
        {doneCount > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setTodos((prev) => prev.filter((t) => !t.completed))}
              className="text-xs text-gray-300 hover:text-red-400 transition-colors"
            >
              完了済みを全て削除 ({doneCount}件)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
