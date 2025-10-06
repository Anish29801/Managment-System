import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import Dashboard from "@/app/page";
import axiosInstance from "@/utils/axiosConfg";
import { useAuth } from "@/app/context/AuthContext";

// ------------------- Mock Setup -------------------
jest.mock("@/utils/axiosConfg");
jest.mock("@/app/components/Clock", () => ({
  __esModule: true,
  default: () => <div data-testid="clock">Mock Clock</div>,
}));
jest.mock("@/app/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;
(mockAxios.interceptors.request.use as jest.Mock) = jest.fn();
(mockAxios.interceptors.response.use as jest.Mock) = jest.fn();

// ------------------- Tests -------------------
describe("Dashboard component", () => {
  const mockUser = { name: "Anish" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches and displays tasks", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    mockAxios.get.mockResolvedValueOnce({
      data: [
        { id: 1, title: "Mock Task 1", completed: false },
        { id: 2, title: "Mock Task 2", completed: true },
      ],
    });

    await act(async () => render(<Dashboard />));

    expect(await screen.findByText(/Mock Task 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/Mock Task 2/i)).toBeInTheDocument();
  });
});
