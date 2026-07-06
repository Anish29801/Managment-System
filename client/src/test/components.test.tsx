import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Card from "@/app/components/Card";
import Toast from "@/app/components/Toast";
import { Pagination } from "@/app/components/Pagination";
import Clock from "@/app/components/Clock";

describe("Card", () => {
  const defaultProps = {
    icon: <span data-testid="test-icon">🔍</span>,
    title: "Test Title",
    description: "Test Description",
  };

  it("renders title and description", () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders icon", () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });
});

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the message", () => {
    render(<Toast message="Task saved" />);
    expect(screen.getByText("Task saved")).toBeInTheDocument();
  });

  it("renders with custom color class", () => {
    const { container } = render(<Toast message="Error" color="red" />);
    expect(container.firstChild).toHaveClass("bg-red-500");
  });

  it("calls onClose after duration", () => {
    const onClose = vi.fn();
    render(<Toast message="Auto close" duration={1000} onClose={onClose} />);
    expect(onClose).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("Pagination", () => {
  it("renders current page and total pages", () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={() => {}} />);
    expect(screen.getByText("3 / 10")).toBeInTheDocument();
  });

  it("disables prev button on first page", () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[1]).toBeDisabled();
  });

  it("calls onPageChange with prev page", async () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);
    const user = userEvent.setup();
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with next page", async () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);
    const user = userEvent.setup();
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[1]);
    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});

describe("Clock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders time in HH:MM AM/PM format", () => {
    // Fix the date to a known time
    const fixedDate = new Date(2025, 0, 15, 14, 30, 0); // 2:30 PM
    vi.setSystemTime(fixedDate);
    render(<Clock />);
    expect(screen.getByText("2:30 PM")).toBeInTheDocument();
  });
});
