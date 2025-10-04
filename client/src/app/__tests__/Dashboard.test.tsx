import { render, screen } from "@testing-library/react";
import Dashboard from "@/app/page";
import { useAuth } from "@/app/context/AuthContext";

jest.mock("@/app/context/AuthContext", () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

describe("Dashboard component", () => {
  const mockUser = { name: "Anish", email: "anish@example.com" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders greeting when user is logged in", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    render(<Dashboard />);
    expect(screen.getByText(/Hi, Anish Good/i)).toBeInTheDocument();
  });

  it("shows guest section when user is not logged in", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<Dashboard />);
    expect(
      screen.getByText(/Please login to access your personalized task dashboard/i)
    ).toBeInTheDocument();
  });
});
