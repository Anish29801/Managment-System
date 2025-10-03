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
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders greeting", () => {
    render(<Dashboard />);
    expect(screen.getByText(/Hi, Anish Good/i)).toBeInTheDocument();
  });
});
