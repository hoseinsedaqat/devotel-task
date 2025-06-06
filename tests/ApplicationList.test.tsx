import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ApplicationList from "./ApplicationList"; // adjust path if needed

const mockApplications = [
  { name: "Alice", age: 30, insuranceType: "Life" },
  { name: "Bob", age: 25, insuranceType: "Health" },
  { name: "Charlie", age: 40, insuranceType: "Car" },
];

describe("ApplicationList", () => {
  it("renders without crashing", () => {
    render(<ApplicationList applications={mockApplications} />);
    expect(screen.getByText("Submitted Applications")).toBeInTheDocument();
  });

  it("renders all columns", () => {
    render(<ApplicationList applications={mockApplications} />);
    expect(screen.getByText("Insurance Type")).toBeInTheDocument();
    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("age")).toBeInTheDocument();
  });

  it("filters results based on search", () => {
    render(<ApplicationList applications={mockApplications} />);
    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Bob" } });
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("sorts results by clicking column header", () => {
    render(<ApplicationList applications={mockApplications} />);
    const nameHeader = screen.getByText("name");
    fireEvent.click(nameHeader); // sort asc
    fireEvent.click(nameHeader); // sort desc
    expect(screen.getAllByText(/Alice|Bob|Charlie/)[0]).toHaveTextContent("Charlie");
  });

  it("paginates correctly", () => {
    const longList = Array.from({ length: 15 }, (_, i) => ({
      name: `User ${i + 1}`,
      insuranceType: "Life",
      age: 20 + i,
    }));
    render(<ApplicationList applications={longList} />);
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
  });
});
