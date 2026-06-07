import { useState, useEffect } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      try {
        return JSON.parse(saved).map((t: Todo) => ({
          ...t,
          createdAt: new Date(t.createdAt),
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: trimmed,
        completed: false,
        createdAt: new Date(),
      },
    ]);
    setInputValue("");
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const startEditing = (id: number, text: string) => {
    setIsEditing(id);
    setEditText(text);
  };

  const saveEdit = (id: number) => {
    const trimmed = editText.trim();
    if (!trimmed) {
      deleteTodo(id);
      return;
    }
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: trimmed } : todo
      )
    );
    setIsEditing(null);
    setEditText("");
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  const handleKeyDown = (
    e: React.KeyboardEvent,
    action: () => void
  ) => {
    if (e.key === "Enter") action();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 transition-colors duration-500">
      <div className="max-w-lg mx-auto px-4 py-8 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-300 bg-clip-text text-transparent mb-2">
            Todo App
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Vazifalaringizni boshqaring
          </p>
        </div>

        {/* Add Todo */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-500/10 dark:shadow-indigo-900/30 border border-white/50 dark:border-gray-700/50 p-4 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, addTodo)}
              placeholder="Yangi vazifa qo'shing..."
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600/50 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-base"
            />
            <button
              onClick={addTodo}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 active:scale-95"
            >
              Qo'shish
            </button>
          </div>
        </div>

        {/* Filters + Stats */}
        {todos.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-500/10 dark:shadow-indigo-900/30 border border-white/50 dark:border-gray-700/50 p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
                {(
                  [
                    { key: "all", label: "Barchasi" },
                    { key: "active", label: "Faol" },
                    { key: "completed", label: "Bajarilgan" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filter === f.key
                        ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-300 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {activeCount} ta faol
              </span>
            </div>

            {/* Progress bar */}
            {todos.length > 0 && (
              <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (completedCount / todos.length) * 100
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Todo List */}
        <div className="space-y-3">
          {filteredTodos.length === 0 && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-500/10 dark:shadow-indigo-900/30 border border-white/50 dark:border-gray-700/50 p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-400 dark:text-gray-500 text-lg">
                {filter === "all"
                  ? "Hali hech qanday vazifa yo'q"
                  : filter === "active"
                  ? "Barcha vazifalar bajarilgan! 🎉"
                  : "Bajarilgan vazifalar yo'q"}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Yuqoriga yangi vazifa qo'shing
              </p>
            </div>
          )}

          {filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-500/5 dark:shadow-indigo-900/20 border border-white/50 dark:border-gray-700/50 p-4 transition-all duration-200 hover:shadow-indigo-500/15 dark:hover:shadow-indigo-900/30 ${
                todo.completed ? "opacity-75" : ""
              }`}
            >
              {isEditing === todo.id ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, () => saveEdit(todo.id))}
                    className="flex-1 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600/50 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 focus:border-transparent text-base"
                    autoFocus
                    onBlur={() => saveEdit(todo.id)}
                  />
                  <button
                    onClick={() => saveEdit(todo.id)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 active:scale-95 text-sm font-medium"
                  >
                    Saqlash
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                      todo.completed
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-500 dark:border-indigo-400"
                        : "border-gray-300 dark:border-gray-500 hover:border-indigo-400 dark:hover:border-indigo-400"
                    }`}
                  >
                    {todo.completed && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span
                      className={`block text-base truncate ${
                        todo.completed
                          ? "line-through text-gray-400 dark:text-gray-500"
                          : "text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {todo.text}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(todo.createdAt).toLocaleDateString("uz-UZ", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => startEditing(todo.id, todo.text)}
                      className="p-2 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all duration-200"
                      title="Tahrirlash"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200"
                      title="O'chirish"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Clear completed */}
        {completedCount > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={clearCompleted}
              className="px-5 py-2.5 text-sm text-red-500 hover:text-white border border-red-300 dark:border-red-700 hover:bg-red-500 dark:hover:bg-red-600 rounded-xl transition-all duration-200 active:scale-95 font-medium"
            >
              Bajarilganlarni tozalash ({completedCount})
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Ma'lumotlar brauzeringizda saqlanadi
          </p>
        </div>
      </div>
    </div>
  );
}

export default TodoApp;
