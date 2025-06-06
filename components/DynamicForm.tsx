"use client";
import React, { useState, useEffect } from "react";

type FieldBase = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  condition?: { field: string; value: string | number | boolean };
};

type SectionField = FieldBase & {
  type: "section";
  fields: Field[];
};

type SelectField = FieldBase & {
  type: "select";
  options?: string[];
  optionsApi?: string; // URL to fetch options dynamically
};

type RadioField = FieldBase & {
  type: "radio";
  options: string[];
};

type TextField = FieldBase & {
  type: "text" | "number" | "textarea";
};

type Field = SectionField | SelectField | RadioField | TextField;

type FormSchema = {
  title: string;
  fields: Field[];
};

interface Props {
  insuranceType: string;
  onSubmit: (data: Record<string, unknown>) => void;
}

export default function DynamicForm({ insuranceType, onSubmit }: Props) {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetch(`/api/forms/${insuranceType}`).then((res) => res.json()).then(setSchema);
  }, [insuranceType]);

  useEffect(() => {
    if (!schema) return;

    // For all fields with optionsApi, fetch their options
    schema.fields.forEach((field) => {
      const fetchOptionsRecursively = (f: Field) => {
        if ("optionsApi" in f && f.optionsApi) {
          fetch(f.optionsApi)
            .then((res) => res.json())
            .then((options: string[]) =>
              setDynamicOptions((prev) => ({ ...prev, [f.name]: options }))
            );
        }
        if (f.type === "section") {
          f.fields.forEach(fetchOptionsRecursively);
        }
      };
      fetchOptionsRecursively(field);
    });
  }, [schema]);

  if (!schema) return <p>Loading form...</p>;

  // Check condition helper
  function shouldShow(field: Field): boolean {
    if (!field.condition) return true;
    return formData[field.condition.field] === field.condition.value;
  }

  // Validation recursive for nested fields
  function validateFields(fields: Field[]): boolean {
    let valid = true;
    const newErrors: Record<string, string> = {};
    const validateRec = (flds: Field[]) => {
      for (const f of flds) {
        if (!shouldShow(f)) continue;
        if (f.type === "section") {
          validateRec(f.fields);
        } else {
          if (f.required && !formData[f.name]) {
            newErrors[f.name] = "This field is required";
            valid = false;
          }
        }
      }
    };
    validateRec(fields);
    setErrors(newErrors);
    return valid;
  }

  // Render field recursive
  const renderField = (field: Field) => {
    if (!shouldShow(field)) return null;

    if (field.type === "section") {
      return (
        <fieldset key={field.name} style={{ padding: "1em", border: "1px solid #ccc", marginBottom: "1em" }}>
          <legend style={{ fontWeight: "bold" }}>{field.label}</legend>
          {field.fields.map(renderField)}
        </fieldset>
      );
    }

    const rawValue = formData[field.name];
    const value =
      typeof rawValue === "string" || typeof rawValue === "number"
        ? rawValue
        : "";
    const error = errors[field.name];

    const commonProps = {
      id: field.name,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setFormData((prev) => ({ ...prev, [field.name]: e.target.value })),
    };

    return (
      <div key={field.name} style={{ marginBottom: 12 }}>
        <label htmlFor={field.name} style={{ display: "block", fontWeight: "bold" }}>
          {field.label} {field.required && "*"}
        </label>
        {field.type === "text" || field.type === "number" ? (
          <input
            {...commonProps}
            type={field.type}
            style={{ width: "100%", padding: "8px", borderColor: error ? "red" : "#ccc" }}
          />
        ) : field.type === "textarea" ? (
          <textarea
            {...commonProps}
            rows={3}
            style={{ width: "100%", padding: "8px", borderColor: error ? "red" : "#ccc" }}
          />
        ) : field.type === "select" ? (
          <select
            {...commonProps}
            style={{ width: "100%", padding: "8px", borderColor: error ? "red" : "#ccc" }}
          >
            <option value="">-- Select --</option>
            {(field.options || dynamicOptions[field.name] || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : field.type === "radio" ? (
          field.options.map((opt) => (
            <label key={opt} style={{ marginRight: 12 }}>
              <input
                type="radio"
                name={field.name}
                value={opt}
                checked={formData[field.name] === opt}
                onChange={() => setFormData((prev) => ({ ...prev, [field.name]: opt }))}
              />{" "}
              {opt}
            </label>
          ))
        ) : null}
        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields(schema.fields)) return;
    onSubmit(formData);
    setFormData({});
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto" }}>
      <h2>{schema.title}</h2>
      {schema.fields.map(renderField)}
      <button type="submit" style={{ marginTop: 20, padding: "8px 16px" }}>
        Submit
      </button>
    </form>
  );
}
