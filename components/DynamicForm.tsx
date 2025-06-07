"use client";

import { useEffect, useState } from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Spinner_img from "../public/Spinner_img.gif";
import { toast } from "react-toastify";

type FieldType = {
  id: string;
  label: string;
  type: "text" | "date" | "number" | "select" | "radio" | "checkbox" | "group";
  required?: boolean;
  options?: string[];
  dynamicOptions?: {
    endpoint: string;
    dependsOn: string;
  };
  visibility?: {
    dependsOn: string;
    condition: "equals";
    value: string;
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  fields?: FieldType[]; // for group type
};

type FieldProps = {
  field: FieldType;
  formValues: Record<string, unknown>;
  setFormValues: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  dynamicOptionsCache: Record<string, string[]>;
};

function Field({ field, formValues, setFormValues, dynamicOptionsCache }: FieldProps) {
  const isVisible = () => {
    if (!field.visibility) return true;
    const { dependsOn, condition, value } = field.visibility;
    const dependsValue = formValues[dependsOn];
    if (condition === "equals") return dependsValue === value;
    return true;
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  };

  if (field.type === "group") {
    return (
      <fieldset style={{ marginBottom: 20, padding: 10, border: "1px solid #ccc" }}>
        <legend>{field.label}</legend>
        {field.fields && field.fields.map((subField) => (
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

  let options = field.options || [];
  if (field.dynamicOptions && dynamicOptionsCache[field.id]) {
    options = dynamicOptionsCache[field.id];
  }

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
            id={field.id}
            name={field.id}
            value={
              typeof formValues[field.id] === "string" ||
              typeof formValues[field.id] === "number"
                ? (formValues[field.id] as string | number)
                : ""
            }
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            pattern={field.validation?.pattern}
            onChange={onChange}
          />
        </div>
      );

    case "select":
      return (
        <div style={{ marginBottom: 15 }}>
          <label htmlFor={field.id}>
            {field.label} {field.required && "*"}
          </label>
          <br />
          <select
            id={field.id}
            name={field.id}
            value={
              typeof formValues[field.id] === "string" ||
              typeof formValues[field.id] === "number"
                ? (formValues[field.id] as string | number)
                : ""
            }
            // required={field.required}
            onChange={onChange}
          >
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
                onChange={onChange}
                required={field.required}
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
                checked={Array.isArray(formValues[field.id] as unknown[]) && (formValues[field.id] as string[]).includes(opt)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormValues((prev) => {
                    const prevValues = Array.isArray(prev[field.id]) ? prev[field.id] as string[] : [];
                    if (checked) {
                      return { ...prev, [field.id]: [...prevValues, opt] };
                    } else {
                      return { ...prev, [field.id]: prevValues.filter((v) => v !== opt) };
                    }
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
}

type DynamicInsuranceFormProps = {
  formId: string;
  onSubmit?: (values: Record<string, unknown>) => void;
};

export default function DynamicInsuranceForm({ formId }: DynamicInsuranceFormProps) {
  interface ApiFormField {
    id: string;
    label: string;
    type: string;
    required?: boolean;
    options?: string[];
    dynamicOptions?: {
      endpoint: string;
      dependsOn: string;
    };
    visibility?: {
      dependsOn: string;
      condition: string;
      value: string;
    };
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
    };
    fields?: ApiFormField[];
  }

  interface ApiForm {
    formId: string;
    title: string;
    fields: ApiFormField[];
  }
  const [form, setForm] = useState<ApiForm | null>(null);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [dynamicOptionsCache, setDynamicOptionsCache] = useState({});
   const router = useRouter();
  
  useEffect(() => {
    fetch("https://assignment.devotel.io/api/insurance/forms")
      .then((res) => res.json())
      .then((data) => {
        interface ApiFormField {
          id: string;
          label: string;
          type: string;
          required?: boolean;
          options?: string[];
          dynamicOptions?: {
            endpoint: string;
            dependsOn: string;
          };
          visibility?: {
            dependsOn: string;
            condition: string;
            value: string;
          };
          validation?: {
            min?: number;
            max?: number;
            pattern?: string;
          };
          fields?: ApiFormField[];
        }

        interface ApiForm {
          formId: string;
          title: string;
          fields: ApiFormField[];
        }

        const selected: ApiForm | undefined = (data as ApiForm[]).find((f) => f.formId === formId);
        setForm(selected || null);

        if (selected) {
          const initValues: Record<string, string> = {};
            interface TraverseField {
            id: string;
            type: string;
            fields?: TraverseField[];
            }

            const traverse = (fields: TraverseField[]): void => {
            fields.forEach((field: TraverseField) => {
              if (field.type === "group" && field.fields) {
              traverse(field.fields);
              } else {
              initValues[field.id] = "";
              }
            });
            };
          traverse(selected.fields);
          setFormValues(initValues);
        }
      });
  }, [formId]);

  useEffect(() => {
    if (!form) return;

    const dynamicFields: ApiFormField[] = [];

    interface FindDynamicField {
      id: string;
      type: string;
      fields?: FindDynamicField[];
      dynamicOptions?: {
      endpoint: string;
      dependsOn: string;
      };
    }

    const findDynamicFields = (fields: FindDynamicField[]): void => {
      fields.forEach((field: FindDynamicField) => {
      if (field.type === "group" && field.fields) findDynamicFields(field.fields);
      else if (field.dynamicOptions) dynamicFields.push(field as ApiFormField);
      });
    };

    findDynamicFields(form.fields);

    dynamicFields.forEach((field) => {
      if (!field.dynamicOptions) {
        setDynamicOptionsCache((prev) => ({ ...prev, [field.id]: [] }));
        return;
      }
      const dependsOnValue = formValues[field.dynamicOptions.dependsOn];
      if (!dependsOnValue) {
        setDynamicOptionsCache((prev) => ({ ...prev, [field.id]: [] }));
        return;
      }
      const url = `${field.dynamicOptions.endpoint}?${field.dynamicOptions.dependsOn}=${dependsOnValue}`;

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

  if (!form) return <p className="spinner-loading">
    <Image src={Spinner_img} alt="Loading..." width={70} height={70} />
  </p>;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log("Submitting:", formValues);
    toast.success("Application submitted successfully!",{position: "top-center",theme: "colored"});
    router.push("/applications");
  };

  function convertApiFormFieldToFieldType(field: ApiFormField): FieldType {
    return {
      id: field.id,
      label: field.label,
      type: field.type as FieldType["type"],
      required: field.required,
      options: field.options,
      dynamicOptions: field.dynamicOptions,
      visibility: field.visibility
        ? {
            dependsOn: field.visibility.dependsOn,
            condition: field.visibility.condition as "equals",
            value: field.visibility.value,
          }
        : undefined,
      validation: field.validation,
      fields: field.fields
        ? field.fields.map(convertApiFormFieldToFieldType)
        : undefined,
    };
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto" }}>
      <h2>{form.title}</h2>

      {form.fields.map((field) => (
        <Field
          key={field.id}
          field={convertApiFormFieldToFieldType(field)}
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
