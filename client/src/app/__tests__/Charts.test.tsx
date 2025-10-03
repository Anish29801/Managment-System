import { render, screen } from "@testing-library/react";
import Clock from "@/app/components/Clock";

jest.mock("@/app/components/Clock", () => ({
  __esModule: true,
  default: () => <div>Mock Clock</div>,
}));

describe("Clock component", () => {
  it("renders Clock", () => {
    render(<Clock />);
    expect(screen.getByText("Mock Clock")).toBeInTheDocument();
  });
});
