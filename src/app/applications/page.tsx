"use client";

import React, { useEffect, useState } from "react";
import ApplicationList from "../../../components/ApplicationList"; // Adjust import if needed

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("https://assignment.devotel.io/api/insurance/forms/submissions");

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const json = await response.json();

        // ✅ Only pass the `data` array
        setApplications(Array.isArray(json.data) ? json.data : []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch applications");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return <ApplicationList applications={applications} />;
}
