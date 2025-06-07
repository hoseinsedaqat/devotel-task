"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from 'next/link';

// Dynamically import client components to avoid SSR issues
const DynamicForm = dynamic(() => import("../../components/DynamicForm"), { ssr: false });
const ApplicationList = dynamic(() => import("../../components/ApplicationList"), { ssr: false });

type Application = {
  insuranceType: "health_insurance_application" | "home_insurance_application" | "car_insurance_application";
  [key: string]: string | number | "car" | "home" | "health";
};

export default function Home() {
  const [view, setView] = useState<"form" | "list">("form");
  const [insuranceType, setInsuranceType] = useState<"health_insurance_application" | "home_insurance_application" | "car_insurance_application">("car_insurance_application");
  const [applications, setApplications] = useState<Application[]>([]);

  // Add application with insuranceType included
  const addApplication = async (formData: Record<string, unknown>) => {
    try {
      const response = await fetch("https://assignment.devotel.io/api/insurance/forms/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.message || "Submission failed");
      }

      const result = await response.json();
      setApplications((apps) => [...apps, { ...formData, insuranceType }]);
      setView("list");
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error submitting application:", error);
        throw error;
      } else {
        console.error("Error submitting application:", error);
        throw new Error("An unknown error occurred");
      }
    }
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
              setInsuranceType(e.target.value as "car_insurance_application" | "health_insurance_application" | "home_insurance_application")
            }
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="car_insurance_application">Car</option>
            <option value="home_insurance_application">Home</option>
            <option value="health_insurance_application">Health</option>
          </select>
        </div>

        <div className="flex gap-3" id="insuranceTypeSelector">
          <Link
            href={`/`}
            // onClick={() => setView("form")}
          >
            Apply
          </Link>
          <Link
            // onClick={() => setView("list")}
            href={'/applications'}
          >
            Applications
          </Link>
        </div>
      </nav>

      {/* Show form or application list */}
      <section>
        {view === "form" && <DynamicForm formId={insuranceType} onSubmit={addApplication} />}
        {view === "list" && <ApplicationList applications={applications} />}
      </section>
    </main>
  );
}
