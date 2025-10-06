import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import Dashboard from "@/app/page";
<<<<<<< HEAD
import axiosInstance from "@/utils/axiosConfg";
import { useAuth } from "@/app/context/AuthContext";

// ------------------- Mock Setup -------------------
jest.mock("@/utils/axiosConfg");
=======
import { useAuth } from "@/app/context/AuthContext";

/* 🧩 Mock Clock component */
>>>>>>> 633c38ef2b2cf5406c81bc108597c924c1584b2a
jest.mock("@/app/components/Clock", () => ({
  __esModule: true,
  default: () => <div data-testid="clock">Mock Clock</div>,
}));
<<<<<<< HEAD
=======

/* 🧩 Mock useAuth hook */
>>>>>>> 633c38ef2b2cf5406c81bc108597c924c1584b2a
jest.mock("@/app/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

<<<<<<< HEAD
const mockAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;
(mockAxios.interceptors.request.use as jest.Mock) = jest.fn();
(mockAxios.interceptors.response.use as jest.Mock) = jest.fn();
=======
/* 🧩 Mock axiosInstance */
import mockAxiosInstance from "@/utils/axiosConfg";

jest.mock("@/utils/axiosConfg", () => {
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

/* 🧩 Setup localStorage mock */
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
>>>>>>> 633c38ef2b2cf5406c81bc108597c924c1584b2a

// ------------------- Tests -------------------
describe("Dashboard component", () => {
  const mockUser = { name: "Anish" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

<<<<<<< HEAD
  it("fetches and displays tasks", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    mockAxios.get.mockResolvedValueOnce({
=======
  it("shows HeroSection when user is not logged in", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    await act(async () => render(<Dashboard />));
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it("fetches and displays tasks", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (mockAxiosInstance.get as jest.Mock).mockResolvedValueOnce({
>>>>>>> 633c38ef2b2cf5406c81bc108597c924c1584b2a
      data: [
        { id: 1, title: "Mock Task 1", completed: false },
        { id: 2, title: "Mock Task 2", completed: true },
      ],
    });

    await act(async () => render(<Dashboard />));

    expect(await screen.findByText(/Mock Task 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/Mock Task 2/i)).toBeInTheDocument();
  });
<<<<<<< HEAD
=======

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
>>>>>>> 633c38ef2b2cf5406c81bc108597c924c1584b2a
});
