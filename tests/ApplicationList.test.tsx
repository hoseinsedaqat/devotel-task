import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import ApplicationList from "../components/ApplicationList"; // update if needed

const applications = [
  { name: "Alice", age: 30, insuranceType: "Life" },
  { name: "Bob", age: 25, insuranceType: "Health" },
  { name: "Charlie", age: 40, insuranceType: "Car" },
];

describe("ApplicationList", () => {
  it("renders the heading", () => {
    render(<ApplicationList applications={applications} />);
    expect(screen.getByText("Submitted Applications")).toBeInTheDocument();
  });

  it("renders column headers dynamically", () => {
    render(<ApplicationList applications={applications} />);
    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("age")).toBeInTheDocument();
    expect(screen.getByText("insuranceType")).toBeInTheDocument();
  });

  it("filters results based on search input", () => {
    render(<ApplicationList applications={applications} />);
    const searchInput = screen.getByPlaceholderText("Search...");

    fireEvent.change(searchInput, { target: { value: "Bob" } });
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });

  it("sorts results when clicking column headers", () => {
    render(<ApplicationList applications={applications} />);
    const nameHeader = screen.getByText("name");

    fireEvent.click(nameHeader); // sort ascending
    let rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Alice");

    fireEvent.click(nameHeader); // sort descending
    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Charlie");
  });

  it("paginates correctly when there are more than 5 results", () => {
    const manyApplications = Array.from({ length: 12 }, (_, i) => ({
      name: `User ${i + 1}`,
      age: 20 + i,
      insuranceType: "Health",
    }));

    render(<ApplicationList applications={manyApplications} />);
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
  });

  it("shows 'No results found.' when search yields no match", () => {
    render(<ApplicationList applications={applications} />);
    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "Zebra" } });
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });
});