"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import client components to avoid SSR issues
const DynamicForm = dynamic(() => import("../../components/DynamicForm"), { ssr: false });
const ApplicationList = dynamic(() => import("../../components/ApplicationList"), { ssr: false });

type Application = {
  insuranceType: "car" | "home" | "life" | "health";
  [key: string]: string | number | "car" | "home" | "life" | "health";
};

export default function Home() {
  const [view, setView] = useState<"form" | "list">("form");
  const [insuranceType, setInsuranceType] = useState<"car" | "home" | "life" | "health">("car");
  const [applications, setApplications] = useState<Application[]>([]);

  // Add application with insuranceType included
  const addApplication = (formData: Record<string, unknown>) => {
    // Convert unknown values to string or number as needed
    const sanitizedFormData: Omit<Application, "insuranceType"> = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, typeof value === "string" || typeof value === "number" ? value : String(value)])
    );
    setApplications((apps) => [...apps, { ...sanitizedFormData, insuranceType }]);
    setView("list");
  };

  return (
    <main className="p-8 max-w-4xl mx-auto bg-white shadow-lg rounded-md">
      <nav className="mb-8 flex flex-wrap items-center gap-4 justify-between">
        {/* Insurance Type Selector */}
        <div className="flex items-center gap-2" id="insuranceTypeSelector">
          <label htmlFor="insuranceType" className="font-semibold text-gray-700">
            Insurance Type:
          </label>
          <select
            id="insuranceType"
            value={insuranceType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setInsuranceType(e.target.value as "car" | "home" | "life" | "health")
            }
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="car">Car</option>
            <option value="home">Home</option>
            <option value="life">Life</option>
            <option value="health">Health</option>
          </select>
        </div>

        <div className="flex gap-3" id="insuranceTypeSelector">
          <button
            className={`px-5 py-2 rounded-md font-semibold transition-colors ${
              view === "form"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setView("form")}
          >
            Apply
          </button>
          <button
            className={`px-5 py-2 rounded-md font-semibold transition-colors ${
              view === "list"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setView("list")}
            disabled={applications.length === 0}
          >
            Applications ({applications.length})
          </button>
        </div>
      </nav>

      {/* Show form or application list */}
      <section>
        {view === "form" && <DynamicForm insuranceType={insuranceType} onSubmit={addApplication} />}
        {view === "list" && <ApplicationList applications={applications} />}
      </section>
    </main>
  );
}
