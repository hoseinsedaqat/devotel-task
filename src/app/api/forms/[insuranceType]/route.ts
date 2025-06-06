import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Extract the dynamic segment `[insuranceType]` from the URL
  const segments = request.nextUrl.pathname.split("/");
  const insuranceType = segments[segments.length - 1]?.toLowerCase();

  type InsuranceType = 'home' | 'car' | 'health' | 'life';

  const schemas = {
    home: {
      title: "Home Insurance",
      fields: [
        {
          name: "address",
          label: "Address",
          type: "section",
          fields: [
            { name: "street", label: "Street", type: "text", required: true },
            { name: "city", label: "City", type: "text", required: true },
            {
              name: "state",
              label: "State",
              type: "select",
              optionsApi: "/api/options/states?country=USA",
              required: true,
            },
            { name: "zip", label: "Zip Code", type: "text", required: true },
          ],
        },
        {
          name: "hasSecurity",
          label: "Do you have a security system?",
          type: "radio",
          options: ["Yes", "No"],
          required: true,
        },
        {
          name: "securityType",
          label: "Security System Type",
          type: "text",
          required: true,
          condition: { field: "hasSecurity", value: "Yes" },
        },
      ],
    },
    car: {
      title: "Car Insurance",
      fields: [
        { name: "fullName", label: "Full Name", type: "text", required: true },
        {
          name: "hasAccidents",
          label: "Have you had any accidents?",
          type: "radio",
          options: ["Yes", "No"],
          required: true,
        },
        {
          name: "numAccidents",
          label: "Number of Accidents",
          type: "number",
          required: true,
          condition: { field: "hasAccidents", value: "Yes" },
        },
        {
          name: "vehicle",
          label: "Vehicle Details",
          type: "section",
          fields: [
            { name: "make", label: "Make", type: "text", required: true },
            { name: "model", label: "Model", type: "text", required: true },
            { name: "year", label: "Year", type: "number", required: true },
          ],
        },
      ],
    },
    health: {
      title: "Health Insurance",
      fields: [
        { name: "fullName", label: "Full Name", type: "text", required: true },
        {
          name: "gender",
          label: "Gender",
          type: "radio",
          options: ["Male", "Female", "Other"],
          required: true,
        },
        {
          name: "pregnancyStatus",
          label: "Pregnancy Status",
          type: "select",
          options: ["Not Pregnant", "Pregnant"],
          condition: { field: "gender", value: "Female" },
        },
      ],
    },
    life: {
      title: "Life Insurance",
      fields: [
        { name: "fullName", label: "Full Name", type: "text", required: true },
        {
          name: "age",
          label: "Age",
          type: "number",
          required: true,
          validation: { min: 18, max: 75 },
        },
        {
          name: "smoker",
          label: "Do you smoke?",
          type: "radio",
          options: ["Yes", "No"],
          required: true,
        },
        {
          name: "coverageAmount",
          label: "Desired Coverage Amount ($)",
          type: "select",
          options: ["100000", "250000", "500000", "1000000"],
          required: true,
        },
        {
          name: "medicalConditions",
          label: "Do you have any pre-existing medical conditions?",
          type: "radio",
          options: ["Yes", "No"],
          required: true,
        },
        {
          name: "medicalDetails",
          label: "Please specify your medical conditions",
          type: "textarea",
          required: true,
          condition: { field: "medicalConditions", value: "Yes" },
        },
        {
          name: "beneficiaryName",
          label: "Primary Beneficiary Name",
          type: "text",
          required: true,
        },
        {
          name: "relationship",
          label: "Relationship to Beneficiary",
          type: "text",
          required: true,
        },
      ],
    },
  };

  const schema = insuranceType && (insuranceType in schemas)
    ? schemas[insuranceType as InsuranceType]
    : null;

  if (!schema) {
    return NextResponse.json({ error: "Invalid insurance type" }, { status: 404 });
  }

  return NextResponse.json(schema);
}
