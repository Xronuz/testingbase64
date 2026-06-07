import ErrorBoundary from "./components/ErrorBoundary";
import TodoApp from "./components/TodoApp";

function App() {
  return (
    <ErrorBoundary>
      <TodoApp />
    </ErrorBoundary>
  );
}

export default App;
