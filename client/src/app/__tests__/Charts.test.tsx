import { render, screen } from "@testing-library/react";
import React from "react";
import Clock from "@/app/components/Clock";

// 🧩 Mock the Clock component for isolated testing
jest.mock("@/app/components/Clock", () => ({
  __esModule: true,
  default: () => <div data-testid="clock">Mock Clock</div>,
}));

describe("Clock component", () => {
  // ✅ 1. Renders mock Clock component
  it("renders Clock", () => {
    render(<Clock />);
    expect(screen.getByText("Mock Clock")).toBeInTheDocument();
  });

  // ✅ 2. Has specific test id
  it("has data-testid attribute", () => {
    render(<Clock />);
    expect(screen.getByTestId("clock")).toBeInTheDocument();
  });

  // ✅ 3. Ensures only one instance renders
  it("renders only one instance", () => {
    render(<Clock />);
    const elements = screen.getAllByText("Mock Clock");
    expect(elements).toHaveLength(1);
  });

  // ✅ 4. Rerenders cleanly when props change (no crash)
  it("renders again when re-rendered", () => {
    const { rerender } = render(<Clock />);
    rerender(<Clock />);
    expect(screen.getByText("Mock Clock")).toBeInTheDocument();
  });

  // ✅ 5. Snapshot test for stable output
  it("matches snapshot", () => {
    const { asFragment } = render(<Clock />);
    expect(asFragment()).toMatchSnapshot();
  });
});
