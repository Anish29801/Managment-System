import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import Dashboard from "@/app/page";
import axios from "axios";
import { useAuth } from "@/app/context/AuthContext";


// 🧩 Mock Clock component for stable snapshot and time-independent tests
jest.mock("@/app/components/Clock", () => ({
  __esModule: true,
  default: () => <div data-testid="clock">Mock Clock</div>,
}));

// 🧩 Mock useAuth hook to simulate logged in/out user
jest.mock("@/app/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// 🧩 Mock Axios to prevent real HTTP requests
jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("Dashboard component", () => {
  const mockUser = { name: "Anish" };

  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mocks
  });

  // ----------------------
  // ✅ 1. Shows HeroSection when user is not logged in
  it("shows HeroSection when user is not logged in", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    await act(async () => {
      render(<Dashboard />);
    });

    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  // ----------------------
  // ✅ 2. Fetches and displays tasks
  it("fetches and displays tasks", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    // 🧩 Mock Axios response for tasks
    mockAxios.get.mockResolvedValueOnce({
      data: [
        { id: 1, title: "Mock Task 1", completed: false },
        { id: 2, title: "Mock Task 2", completed: true },
      ],
    });

    await act(async () => {
      render(<Dashboard />);
    });

    // 🧩 Wait for tasks to appear
    expect(await screen.findByText(/Mock Task 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/Mock Task 2/i)).toBeInTheDocument();
  });

  // ----------------------
  // ✅ 3. Shows Clock component
  it("renders Clock component", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    await act(async () => {
      render(<Dashboard />);
    });

    expect(screen.getByTestId("clock")).toBeInTheDocument();
    expect(screen.getByText("Mock Clock")).toBeInTheDocument();
  });

  // ----------------------
  // ✅ 4. Matches snapshot when logged in
  it("matches snapshot when logged in", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    // 🧩 Mock Axios for consistent task list
    mockAxios.get.mockResolvedValueOnce({
      data: [
        { id: 1, title: "Mock Task 1", completed: false },
        { id: 2, title: "Mock Task 2", completed: true },
      ],
    });

    let asFragment: () => DocumentFragment;
    await act(async () => {
      const renderResult = render(<Dashboard />);
      asFragment = renderResult.asFragment;
    });

    await waitFor(() => screen.getByText(/Hi, Anish Good/i));
    expect(asFragment!()).toMatchSnapshot(); // stable snapshot with mocked Clock and tasks
  });

  // ----------------------
  // ✅ 5. Handles empty tasks gracefully
  it("shows 'No tasks here.' when task list is empty", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    mockAxios.get.mockResolvedValueOnce({ data: [] });

    await act(async () => {
      render(<Dashboard />);
    });

    expect(await screen.findAllByText(/No tasks here/i)).toHaveLength(3); // pending, in-progress, completed
  });

  // ----------------------
  // ✅ 6. Handles Axios error gracefully
  it("shows toast message on fetch error", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    mockAxios.get.mockRejectedValueOnce(new Error("Network Error"));

    await act(async () => {
      render(<Dashboard />);
    });

    expect(await screen.findByText(/❌ Failed to fetch tasks/i)).toBeInTheDocument();
  });

  // Additional tests like Add Task button click, search, filter can go here
});
