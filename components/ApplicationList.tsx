"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

interface Props {
  applications: Record<string, unknown>[];
}

const PAGE_SIZE = 5;

export default function ApplicationList({ applications }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  // Extract all unique keys from the applications
  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    applications.forEach((app) => {
      Object.keys(app).forEach((key) => keys.add(key));
    });
    return Array.from(keys);
  }, [applications]);

  // Manage visible columns
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () =>
      allKeys.reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>)
  );

  // Filter applications by search term
  const filteredApplications = useMemo(() => {
    return applications.filter((app) =>
      allKeys.some(
        (key) =>
          visibleColumns[key] &&
          String(app[key] ?? "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [applications, search, visibleColumns, allKeys]);

  // Sort filtered applications
  const sortedApplications = useMemo(() => {
    if (!sortKey) return filteredApplications;

    return [...filteredApplications].sort((a, b) => {
      const aValue = String(a[sortKey] ?? "");
      const bValue = String(b[sortKey] ?? "");
      return sortAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
  }, [filteredApplications, sortKey, sortAsc]);

  // Pagination logic
  const totalPages = Math.ceil(sortedApplications.length / PAGE_SIZE);
  const pagedApplications = sortedApplications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Handlers
  const toggleColumn = (col: string) => {
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  const handleSort = (col: string) => {
    if (sortKey === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(col);
      setSortAsc(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Styling helpers
  const cellStyle = {
    border: "1px solid #ccc",
    padding: 8,
    whiteSpace: "nowrap" as const,
  };

  return (
    <div style={{ maxWidth: 1000, margin: "auto" }}>
      <h2>Submitted Applications</h2>
      <p>
        <Link href="/">← Back to Form</Link>
      </p>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={handleSearchChange}
        style={{ margin: "10px 0", width: "100%", padding: 8 }}
      />

      {/* Column Toggles */}
      <div style={{ marginBottom: 10, overflowX: "auto" }}>
        <strong>Columns: </strong>
        {allKeys.map((key) => (
          <label key={key} style={{ marginRight: 12, whiteSpace: "nowrap" }}>
            <input
              type="checkbox"
              checked={visibleColumns[key] ?? true}
              onChange={() => toggleColumn(key)}
            />{" "}
            {key}
          </label>
        ))}
      </div>

      {/* Applications Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {allKeys.map(
                (key) =>
                  visibleColumns[key] && (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      style={{
                        ...cellStyle,
                        cursor: "pointer",
                        backgroundColor: sortKey === key ? "#efefef" : undefined,
                      }}
                    >
                      {key} {sortKey === key ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                  )
              )}
            </tr>
          </thead>
          <tbody>
            {pagedApplications.length === 0 ? (
              <tr>
                <td
                  colSpan={allKeys.filter((key) => visibleColumns[key]).length}
                  style={{ textAlign: "center", padding: 12 }}
                >
                  No results found.
                </td>
              </tr>
            ) : (
              pagedApplications.map((app, i) => (
                <tr key={i}>
                  {allKeys.map(
                    (key) =>
                      visibleColumns[key] && (
                        <td
                          key={key}
                          style={{
                            ...cellStyle,
                            maxWidth: 150,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={String(app[key] ?? "")}
                        >
                          {String(app[key] ?? "")}
                        </td>
                      )
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ marginTop: 10, textAlign: "center" }}>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          style={{ marginRight: 10 }}
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages || 1}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages || totalPages === 0}
          style={{ marginLeft: 10 }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
