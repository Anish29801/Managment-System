// src/app/__tests__/Charts.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Charts from "../Charts";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "@/utils/axiosConfg";
import { Task } from "../type";

// ----------------- Mock useAuth -----------------
jest.mock("../context/AuthContext", () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

// ----------------- Mock axios -----------------
jest.mock("@/utils/axiosConfg", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

// ----------------- Optional: Mock Recharts -----------------
jest.mock("recharts", () => {
  const OriginalRecharts = jest.requireActual("recharts");
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    PieChart: ({ children }: any) => <div>{children}</div>,
    Pie: ({ children }: any) => <div>{children}</div>,
    BarChart: ({ children }: any) => <div>{children}</div>,
    Bar: ({ children }: any) => <div>{children}</div>,
    Cell: ({ children }: any) => <div>{children}</div>,
    Tooltip: ({ children }: any) => <div>{children}</div>,
    Legend: ({ children }: any) => <div>{children}</div>,
  };
});

describe("Charts component", () => {
  const mockTasks: Task[] = [
    { id: 1, status: "pending", createdAt: new Date().toISOString() },
    { id: 2, status: "inprogress", createdAt: new Date().toISOString() },
    { id: 3, status: "completed", createdAt: new Date().toISOString() },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading initially", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { name: "Anish" } });
    render(<Charts />);
    expect(screen.getByText(/Loading charts/i)).toBeInTheDocument();
  });

  it("shows login message if no user", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<Charts />);
    expect(screen.getByText(/Please login to see charts/i)).toBeInTheDocument();
  });

  it("fetches and renders chart data", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { name: "Anish" } });
    (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockTasks });

    render(<Charts />);

    // Wait for data to load
    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith("/tasks");
    });

    // Check chart heading
    expect(screen.getByText(/Task Status Overview/i)).toBeInTheDocument();

    // Check that chart data is processed (mocked Recharts renders children)
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
    expect(screen.getByText(/In Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
  });

  it("changes filter dropdown", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { name: "Anish" } });
    (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockTasks });

    render(<Charts />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;

    userEvent.selectOptions(select, "all");
    expect(select.value).toBe("all");

    userEvent.selectOptions(select, "1month");
    expect(select.value).toBe("1month");
  });
});
