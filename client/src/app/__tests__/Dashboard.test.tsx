// src/app/__tests__/Dashboard.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import Dashboard from "@/app/page";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../../utils/axiosConfg";

jest.mock("../context/AuthContext", () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

jest.mock("../../utils/axiosConfg", () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

jest.mock("../components/Clock", () => ({
  __esModule: true,
  default: () => <div>Mock Clock</div>,
}));
jest.mock("../components/HeroSection", () => ({
  __esModule: true,
  default: () => <div>Mock HeroSection</div>,
}));
jest.mock("../components/TaskForm", () => ({
  __esModule: true,
  default: () => <div>Mock TaskForm</div>,
}));
jest.mock("../components/TaskSection", () => ({
  __esModule: true,
  default: ({ title }: any) => <div>Mock TaskSection {title}</div>,
}));
jest.mock("../components/Card", () => ({
  __esModule: true,
  default: ({ title }: any) => <div>Mock Card {title}</div>,
}));
jest.mock("../components/Toast", () => ({
  __esModule: true,
  default: ({ message }: any) => <div>{message}</div>,
}));
jest.mock("@hello-pangea/dnd", () => ({
  __esModule: true,
  DragDropContext: ({ children }: any) => <div>{children}</div>,
}));

describe("Dashboard component", () => {
  const mockUser = { name: "Anish", email: "anish@example.com" };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (axiosInstance.get as jest.Mock).mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders greeting and Clock", () => {
    render(<Dashboard />);
    expect(screen.getByText(/Hi, Anish Good/i)).toBeInTheDocument();
    expect(screen.getByText("Mock Clock")).toBeInTheDocument();
  });

  it("shows HeroSection if no user", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<Dashboard />);
    expect(screen.getByText("Mock HeroSection")).toBeInTheDocument();
  });

  it("opens TaskForm on Add Task click", () => {
    render(<Dashboard />);
    const addBtn = screen.getByText("Add Task");
    fireEvent.click(addBtn);
    expect(screen.getByText("Mock TaskForm")).toBeInTheDocument();
  });
});
