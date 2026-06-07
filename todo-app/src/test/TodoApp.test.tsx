import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import TodoApp from "../components/TodoApp";

/** Helper to prepopulate localStorage with a known todo state */
function seedLocalStorage(todos: Array<{ id: string; text: string; completed: boolean; createdAt: string }>) {
  localStorage.setItem("todos", JSON.stringify(todos));
}

describe("TodoApp", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the app with header and input", () => {
    render(<TodoApp />);
    expect(screen.getByText("Todo App")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Yangi vazifa qo'shing...")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Qo'shish" })
    ).toBeInTheDocument();
  });

  it("shows empty state when no todos exist", () => {
    render(<TodoApp />);
    expect(screen.getByText("Hali hech qanday vazifa yo'q")).toBeInTheDocument();
  });

  describe("adding todos", () => {
    it("adds a todo when text is entered and Qo'shish is clicked", async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "Test vazifa");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));

      expect(screen.getByText("Test vazifa")).toBeInTheDocument();
    });

    it("adds a todo when Enter is pressed", async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "Enter bilan qo'shish{Enter}");

      expect(screen.getByText("Enter bilan qo'shish")).toBeInTheDocument();
    });

    it("does not add empty todo", async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "   ");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));

      expect(screen.getByText("Hali hech qanday vazifa yo'q")).toBeInTheDocument();
    });

    it("clears input after adding", async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "Yangi vazifa");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));

      expect(input).toHaveValue("");
    });
  });

  describe("toggling completion", () => {
    it("toggles a todo as completed on click", async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "Bajariladigan vazifa");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));

      // Find the checkbox button (the completed-toggle circle)
      const todoItem = screen.getByText("Bajariladigan vazifa").closest("div")?.parentElement;
      const toggleButton = todoItem?.querySelector("button");
      expect(toggleButton).toBeTruthy();

      if (toggleButton) {
        await user.click(toggleButton);
        // After toggling, the text should have line-through styling
        const textSpan = screen.getByText("Bajariladigan vazifa");
        expect(textSpan.className).toContain("line-through");
      }
    });

    it("counts active todos correctly after toggling", async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Add two todos
      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "Birinchi");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));
      await user.type(input, "Ikkinchi");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));

      // Initially 2 active
      expect(screen.getByText("2 ta faol")).toBeInTheDocument();

      // Toggle first one
      const firstText = screen.getByText("Birinchi");
      const firstItem = firstText.closest("div")?.parentElement;
      const toggleBtn = firstItem?.querySelector("button");
      if (toggleBtn) await user.click(toggleBtn);

      // Now 1 active
      expect(screen.getByText("1 ta faol")).toBeInTheDocument();
    });
  });

  describe("deleting todos", () => {
    it("deletes a todo when delete button is clicked", async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "O'chiriladigan vazifa");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));

      expect(screen.getByText("O'chiriladigan vazifa")).toBeInTheDocument();

      // Click delete button (the trash icon button)
      const deleteButton = screen.getByTitle("O'chirish");
      await user.click(deleteButton);

      expect(
        screen.queryByText("O'chiriladigan vazifa")
      ).not.toBeInTheDocument();
    });
  });

  describe("filtering", () => {
    it("shows all todos by default", async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "Vazifa A");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));

      expect(screen.getByText("Vazifa A")).toBeInTheDocument();
    });

    it("shows only active todos when Faol filter is selected", async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "Faol vazifa");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));
      await user.type(input, "Bajarilgan vazifa");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));

      // Toggle second todo to completed
      const secondText = screen.getByText("Bajarilgan vazifa");
      const secondItem = secondText.closest("div")?.parentElement;
      const toggleBtn = secondItem?.querySelector("button");
      if (toggleBtn) await user.click(toggleBtn);

      // Click "Faol" filter
      await user.click(screen.getByRole("button", { name: "Faol" }));

      expect(screen.getByText("Faol vazifa")).toBeInTheDocument();
      expect(screen.queryByText("Bajarilgan vazifa")).not.toBeInTheDocument();
    });

    it("shows only completed todos when Bajarilgan filter is selected", async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "Faol vazifa");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));
      await user.type(input, "Tugallangan vazifa");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));

      // Toggle second todo to completed
      const secondText = screen.getByText("Tugallangan vazifa");
      const secondItem = secondText.closest("div")?.parentElement;
      const toggleBtn = secondItem?.querySelector("button");
      if (toggleBtn) await user.click(toggleBtn);

      // Click "Bajarilgan" filter
      await user.click(screen.getByRole("button", { name: "Bajarilgan" }));

      expect(screen.queryByText("Faol vazifa")).not.toBeInTheDocument();
      expect(screen.getByText("Tugallangan vazifa")).toBeInTheDocument();
    });

    it('resets to showing all when Barchasi is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "Test");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));

      // Toggle to completed
      const textEl = screen.getByText("Test");
      const itemDiv = textEl.closest("div")?.parentElement;
      const toggleBtn = itemDiv?.querySelector("button");
      if (toggleBtn) await user.click(toggleBtn);

      // Switch to active filter
      await user.click(screen.getByRole("button", { name: "Faol" }));
      expect(screen.queryByText("Test")).not.toBeInTheDocument();

      // Switch back to all
      await user.click(screen.getByRole("button", { name: "Barchasi" }));
      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });

  describe("localStorage persistence", () => {
    it("loads todos from localStorage on mount", () => {
      seedLocalStorage([
        {
          id: "test-id-1",
          text: "Saqlandi",
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ]);

      render(<TodoApp />);
      expect(screen.getByText("Saqlandi")).toBeInTheDocument();
    });

    it("handles invalid localStorage gracefully", () => {
      localStorage.setItem("todos", "invalid-json");
      render(<TodoApp />);
      expect(screen.getByText("Hali hech qanday vazifa yo'q")).toBeInTheDocument();
    });

    it("saves todos to localStorage after adding", async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "Lokalda saqlansin");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));

      const saved = JSON.parse(localStorage.getItem("todos") || "[]");
      expect(saved).toHaveLength(1);
      expect(saved[0].text).toBe("Lokalda saqlansin");
      expect(saved[0].completed).toBe(false);
    });

    it("updates localStorage after toggling", async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "Toggle test");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));

      // Toggle
      const textEl = screen.getByText("Toggle test");
      const itemDiv = textEl.closest("div")?.parentElement;
      const toggleBtn = itemDiv?.querySelector("button");
      if (toggleBtn) await user.click(toggleBtn);

      const saved = JSON.parse(localStorage.getItem("todos") || "[]");
      expect(saved[0].completed).toBe(true);
    });

    it("updates localStorage after deleting", async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "O'chirish test");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));

      const deleteButton = screen.getByTitle("O'chirish");
      await user.click(deleteButton);

      const saved = JSON.parse(localStorage.getItem("todos") || "[]");
      expect(saved).toHaveLength(0);
    });
  });

  describe("edit behavior", () => {
    it("does not delete todo when edit text is cleared", async () => {
      const user = userEvent.setup();
      render(<TodoApp />);

      // Add a todo
      const input = screen.getByPlaceholderText("Yangi vazifa qo'shing...");
      await user.type(input, "Tahrirlanadigan vazifa");
      await user.click(screen.getByRole("button", { name: "Qo'shish" }));

      // Click edit
      await user.click(screen.getByTitle("Tahrirlash"));

      // Clear the edit input
      const editInput = screen.getByDisplayValue("Tahrirlanadigan vazifa");
      await user.clear(editInput);
      // Press Enter or blur — the saveEdit will run with empty string
      fireEvent.blur(editInput);

      // The todo should still exist (not deleted)
      expect(screen.getByText("Tahrirlanadigan vazifa")).toBeInTheDocument();
    });
  });
});
