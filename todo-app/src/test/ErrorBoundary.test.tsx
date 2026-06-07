import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ErrorBoundary from "../components/ErrorBoundary";

/** A component that throws on render */
function CrashComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test crash!");
  }
  return <div>Ishlayapti</div>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // Suppress console.error from React's caught errors
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Bolalar</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Bolalar")).toBeInTheDocument();
  });

  it("renders fallback UI when child crashes", () => {
    // Need to silence React's error logging for this expected crash
    render(
      <ErrorBoundary>
        <CrashComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Nimadir xato ketdi")).toBeInTheDocument();
    expect(
      screen.getByText("Ilova ishlashida kutilmagan xatolik yuz berdi.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Qayta yuklash" })
    ).toBeInTheDocument();
  });

  it('shows error details in the expandable section when error exists', () => {
    render(
      <ErrorBoundary>
        <CrashComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Texnik tafsilotlar")).toBeInTheDocument();
    expect(screen.getByText("Test crash!")).toBeInTheDocument();
  });

  it("does not show fallback when no error occurs", () => {
    render(
      <ErrorBoundary>
        <CrashComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Ishlayapti")).toBeInTheDocument();
    expect(screen.queryByText("Nimadir xato ketdi")).not.toBeInTheDocument();
  });
});
