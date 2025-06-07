"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Spinner_img from "../public/Spinner_img.gif";
import { toast } from "react-toastify";

// --- Type Definitions ---
type FieldType = {
  id: string;
  label: string;
  type: "text" | "date" | "number" | "select" | "radio" | "checkbox" | "group";
  required?: boolean;
  options?: string[];
  dynamicOptions?: { endpoint: string; dependsOn: string };
  visibility?: { dependsOn: string; condition: "equals"; value: string };
  validation?: { min?: number; max?: number; pattern?: string };
  fields?: FieldType[];
};

type FieldProps = {
  field: FieldType;
  formValues: Record<string, unknown>;
  setFormValues: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  dynamicOptionsCache: Record<string, string[]>;
};

// --- Helper Components ---
const Field = ({ field, formValues, setFormValues, dynamicOptionsCache }: FieldProps) => {
  const isVisible = () => {
    if (!field.visibility) return true;
    const { dependsOn, condition, value } = field.visibility;
    return condition === "equals" ? formValues[dependsOn] === value : true;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" && "checked" in e.target ? (e.target as HTMLInputElement).checked : undefined;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (field.type === "group") {
    return (
      <fieldset style={{ marginBottom: 20, padding: 10, border: "1px solid #ccc" }}>
        <legend>{field.label}</legend>
        {field.fields?.map((subField) => (
          <Field
            key={subField.id}
            field={subField}
            formValues={formValues}
            setFormValues={setFormValues}
            dynamicOptionsCache={dynamicOptionsCache}
          />
        ))}
      </fieldset>
    );
  }

  if (!isVisible()) return null;

  const options = field.dynamicOptions
    ? dynamicOptionsCache[field.id] || []
    : field.options || [];

  const commonInputProps = {
    id: field.id,
    name: field.id,
    onChange: handleChange,
    value:
      typeof formValues[field.id] === "string" || typeof formValues[field.id] === "number"
        ? (formValues[field.id] as string | number)
        : "",
  };

  switch (field.type) {
    case "text":
    case "date":
    case "number":
      return (
        <div style={{ marginBottom: 15 }}>
          <label htmlFor={field.id}>
            {field.label} {field.required && "*"}
          </label>
          <br />
          <input
            type={field.type}
            {...commonInputProps}
            min={field.validation?.min}
            max={field.validation?.max}
            pattern={field.validation?.pattern}
          />
        </div>
      );

    case "select":
      return (
        <div style={{ marginBottom: 15 }}>
          <label htmlFor={field.id}>
            {field.label}
          </label>
          <br />
          <select {...commonInputProps}>
            <option value="">Select...</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    case "radio":
      return (
        <div style={{ marginBottom: 15 }}>
          <p>
            {field.label} {field.required && "*"}
          </p>
          {options.map((opt) => (
            <label key={opt} style={{ marginRight: 10 }}>
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={formValues[field.id] === opt}
                onChange={handleChange}
              />
              {opt}
            </label>
          ))}
        </div>
      );

    case "checkbox":
      return (
        <div style={{ marginBottom: 15 }}>
          <p>
            {field.label} {field.required && "*"}
          </p>
          {options.map((opt) => (
            <label key={opt} style={{ marginRight: 10 }}>
              <input
                type="checkbox"
                name={field.id}
                value={opt}
                checked={
                  Array.isArray(formValues[field.id]) &&
                  (formValues[field.id] as string[]).includes(opt)
                }
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormValues((prev) => {
                    const prevValues = Array.isArray(prev[field.id])
                      ? (prev[field.id] as string[])
                      : [];
                    return {
                      ...prev,
                      [field.id]: checked
                        ? [...prevValues, opt]
                        : prevValues.filter((v) => v !== opt),
                    };
                  });
                }}
              />
              {opt}
            </label>
          ))}
        </div>
      );

    default:
      return null;
  }
};

// --- Main Form Component ---
type DynamicInsuranceFormProps = {
  formId: string;
  onSubmit?: (values: Record<string, unknown>) => void;
};

type ApiFormField = FieldType & { type: string }; // allow more generic parsing
type ApiForm = { formId: string; title: string; fields: ApiFormField[] };

const convertToFieldType = (field: ApiFormField): FieldType => ({
  ...field,
  type: field.type as FieldType["type"],
  fields: field.fields?.map(convertToFieldType),
});

const traverseFields = (fields: ApiFormField[], init: Record<string, unknown>) => {
  fields.forEach((field) => {
    if (field.type === "group" && field.fields) {
      traverseFields(field.fields, init);
    } else {
      init[field.id] = "";
    }
  });
};

const findDynamicFields = (fields: ApiFormField[]): ApiFormField[] => {
  const result: ApiFormField[] = [];
  fields.forEach((field) => {
    if (field.type === "group" && field.fields) {
      result.push(...findDynamicFields(field.fields));
    } else if (field.dynamicOptions) {
      result.push(field);
    }
  });
  return result;
};

export default function DynamicInsuranceForm({ formId }: DynamicInsuranceFormProps) {
  const [form, setForm] = useState<ApiForm | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [dynamicOptionsCache, setDynamicOptionsCache] = useState<Record<string, string[]>>({});
  const router = useRouter();

  useEffect(() => {
    fetch("https://assignment.devotel.io/api/insurance/forms")
      .then((res) => res.json())
      .then((data: ApiForm[]) => {
        const selected = data.find((f) => f.formId === formId) || null;
        setForm(selected);

        if (selected) {
          const initValues: Record<string, unknown> = {};
          traverseFields(selected.fields, initValues);
          setFormValues(initValues);
        }
      });
  }, [formId]);

  useEffect(() => {
    if (!form) return;

    const dynamicFields = findDynamicFields(form.fields);

    dynamicFields.forEach((field) => {
      const { dependsOn, endpoint } = field.dynamicOptions!;
      const dependsValue = formValues[dependsOn];

      if (!dependsValue) {
        setDynamicOptionsCache((prev) => ({ ...prev, [field.id]: [] }));
        return;
      }

      const url = `${endpoint}?${dependsOn}=${dependsValue}`;

      fetch(url)
        .then((res) => res.json())
        .then((options) => {
          setDynamicOptionsCache((prev) => ({ ...prev, [field.id]: options }));
        })
        .catch(() => {
          setDynamicOptionsCache((prev) => ({ ...prev, [field.id]: [] }));
        });
    });
  }, [form, formValues]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Application submitted successfully!", { position: "top-center", theme: "colored" });
    router.push("/applications");
  };

  if (!form) {
    return (
      <p className="spinner-loading">
        <Image src={Spinner_img} alt="Loading..." width={70} height={70} />
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto" }}>
      <h2>{form.title}</h2>
      {form.fields.map((field) => (
        <Field
          key={field.id}
          field={convertToFieldType(field)}
          formValues={formValues}
          setFormValues={setFormValues}
          dynamicOptionsCache={dynamicOptionsCache}
        />
      ))}
      <button type="submit" style={{ marginTop: 20, padding: "8px 16px" }}>
        Submit
      </button>
    </form>
  );
}
