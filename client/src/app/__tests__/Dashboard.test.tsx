import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Dashboard from "@/app/page";
import axiosInstance from "@/utils/axiosConfg";
import { useAuth } from "@/app/context/AuthContext";

// ------------------- Mock Setup -------------------
jest.mock("@/utils/axiosConfg", () => ({
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

jest.mock("@/app/components/Clock", () => ({
  __esModule: true,
  default: () => <div data-testid="clock">Mock Clock</div>,
}));

jest.mock("@/app/components/HeroSection", () => ({
  __esModule: true,
  default: () => <div data-testid="hero-section">Mock Hero</div>,
}));

jest.mock("@/app/components/TaskForm", () => ({
  __esModule: true,
  default: () => <div data-testid="task-form">Mock Task Form</div>,
}));

jest.mock("@/app/components/Toast", () => ({
  __esModule: true,
  default: ({ message }: { message: string }) =>
    message ? <div data-testid="toast">{message}</div> : null,
}));

jest.mock("@/app/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// ------------------- Tests -------------------
describe("Dashboard component", () => {
  const mockUser = { name: "Anish" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Fetches and displays tasks
  it("fetches and displays tasks", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({
      data: [
        { id: "1", title: "Mock Task 1", status: "pending" },
        { id: "2", title: "Mock Task 2", status: "completed" },
      ],
    });

    render(<Dashboard />);

    expect(await screen.findByText(/Mock Task 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/Mock Task 2/i)).toBeInTheDocument();
  });

  // Test 2: Renders guest view when no user is logged in
  it("renders guest view when no user is logged in", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(<Dashboard />);

    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(
      screen.getByText(/Please login to access your personalized task dashboard/i)
    ).toBeInTheDocument();
  });

  // Test 3: Opens TaskForm when "Add Task" is clicked
  it('opens the "TaskForm" modal when Add Task is clicked', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: [] });

    render(<Dashboard />);

    const addButton = screen.getByRole("button", { name: /Add Task/i });
    fireEvent.click(addButton);

    expect(await screen.findByTestId("task-form")).toBeInTheDocument();
  });
});
