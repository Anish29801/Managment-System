import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import Dashboard from "@/app/page";
import { useAuth } from "@/app/context/AuthContext";

// 🧩 Mock Clock component
jest.mock("@/app/components/Clock", () => ({
  __esModule: true,
  default: () => <div data-testid="clock">Mock Clock</div>,
}));

// 🧩 Mock useAuth hook
jest.mock("@/app/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// 🧩 Mock server.ts
import mockAxiosInstance from "@/utils/server";

jest.mock("@/app/utils/server", () => {
  const mInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    __esModule: true,
    default: mInstance,
  };
});

beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
      };
    })(),
    writable: true,
  });
});

describe("Dashboard component", () => {
  const mockUser = { name: "Anish" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows HeroSection when user is not logged in", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    await act(async () => render(<Dashboard />));
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it("fetches and displays tasks", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (mockAxiosInstance.get as jest.Mock).mockResolvedValueOnce({
      data: [
        { id: 1, title: "Mock Task 1", completed: false },
        { id: 2, title: "Mock Task 2", completed: true },
      ],
    });

    await act(async () => render(<Dashboard />));

    expect(await screen.findByText(/Mock Task 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/Mock Task 2/i)).toBeInTheDocument();
  });

  it("renders Clock component", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    await act(async () => render(<Dashboard />));
    expect(screen.getByTestId("clock")).toBeInTheDocument();
    expect(screen.getByText("Mock Clock")).toBeInTheDocument();
  });

  it("matches snapshot when logged in", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (mockAxiosInstance.get as jest.Mock).mockResolvedValueOnce({
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
    expect(asFragment!()).toMatchSnapshot();
  });

  it("shows 'No tasks here.' when task list is empty", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (mockAxiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: [] });

    await act(async () => render(<Dashboard />));
    expect(await screen.findAllByText(/No tasks here/i)).toHaveLength(3);
  });

  it("shows toast message on fetch error", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (mockAxiosInstance.get as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));

    await act(async () => render(<Dashboard />));
    expect(await screen.findByText(/❌ Failed to fetch tasks/i)).toBeInTheDocument();
  });
});
