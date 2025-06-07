"use client";

import React, { useState, useMemo } from "react";
import Link from 'next/link';

interface Props {
  applications: Record<string, unknown>[];
}

export default function ApplicationList({ applications }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  // Get all unique keys from all application objects
  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    applications.forEach((app) => {
      Object.keys(app).forEach((key) => keys.add(key));
    });
    return Array.from(keys);
  }, [applications]);

  // Keep track of visible columns (all visible by default)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() =>
    allKeys.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Filter applications by search on visible fields
  const filtered = useMemo(() => {
    return applications.filter((app) =>
      allKeys.some(
        (key) =>
          visibleColumns[key] &&
          String(app[key] ?? "")
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    );
  }, [applications, search, visibleColumns, allKeys]);

  // Sort filtered applications
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      if ((a[sortKey] ?? "") < (b[sortKey] ?? "")) return sortAsc ? -1 : 1;
      if ((a[sortKey] ?? "") > (b[sortKey] ?? "")) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortAsc]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleColumn = (col: string) =>
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));

  const handleSort = (col: string) => {
    if (sortKey === col) setSortAsc(!sortAsc);
    else {
      setSortKey(col);
      setSortAsc(true);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "auto" }}>
      <h2>Submitted Applications</h2>
      <p>
        <Link href="/">← Back to Form</Link></p>
      {/* Search input */}
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        style={{ marginBottom: 10, width: "100%", padding: 8 ,marginTop: 10}}
      />

      {/* Column visibility toggles */}
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

      {/* Applications table */}
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
                        border: "1px solid #ccc",
                        padding: 8,
                        cursor: "pointer",
                        backgroundColor: sortKey === key ? "#efefef" : undefined,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {key} {sortKey === key ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                  )
              )}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td
                  colSpan={allKeys.filter((key) => visibleColumns[key]).length}
                  style={{ textAlign: "center", padding: 12 }}
                >
                  No results found.
                </td>
              </tr>
            )}
            {paged.map((app, i) => (
              <tr key={i}>
                {allKeys.map(
                  (key) =>
                    visibleColumns[key] && (
                      <td
                        key={key}
                        style={{
                          border: "1px solid #ccc",
                          padding: 8,
                          whiteSpace: "nowrap",
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
