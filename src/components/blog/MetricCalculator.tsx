"use client";

import { useState, useCallback } from "react";

interface Field {
  /** Unique key used in the formula function */
  name: string;
  /** Label shown to the user */
  label: string;
  /** Default starting value */
  defaultValue?: number;
  /** Suffix displayed after the input (e.g. "%", "$", "months") */
  suffix?: string;
  /** Prefix displayed before the input (e.g. "$") */
  prefix?: string;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Step increment */
  step?: number;
}

interface Result {
  /** Label shown for the result */
  label: string;
  /** Suffix displayed after the value */
  suffix?: string;
  /** Prefix displayed before the value */
  prefix?: string;
}

interface MetricCalculatorProps {
  /** Calculator title, e.g. "MRR Calculator" */
  title: string;
  /** Short description of what this calculates */
  description?: string;
  /** Input fields configuration */
  fields: Field[];
  /** Result display configuration */
  result: Result;
  /** Formula function: receives an object of {fieldName: value} and returns the result number */
  formula: (values: Record<string, number>) => number;
  /** Optional accent color */
  color?: string;
}

export function MetricCalculator({
  title,
  description,
  fields,
  result,
  formula,
  color = "#5E81F4",
}: MetricCalculatorProps) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const field of fields) {
      initial[field.name] = field.defaultValue ?? 0;
    }
    return initial;
  });

  const handleChange = useCallback((name: string, raw: string) => {
    const num = parseFloat(raw);
    setValues((prev) => ({ ...prev, [name]: isNaN(num) ? 0 : num }));
  }, []);

  let computed: number;
  try {
    computed = formula(values);
  } catch {
    computed = 0;
  }

  const formatted =
    !isFinite(computed) || isNaN(computed)
      ? "—"
      : computed >= 1_000_000
        ? `${(computed / 1_000_000).toFixed(2)}M`
        : computed >= 10_000
          ? `${(computed / 1_000).toFixed(1)}K`
          : computed % 1 === 0
            ? computed.toLocaleString("en-US")
            : computed.toFixed(2);

  return (
    <div className="not-prose my-8 rounded-xl border border-[#ECECF2] bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#ECECF2]" style={{ borderTopWidth: 3, borderTopColor: color }}>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-base font-bold text-[#1C1D21]">{title}</h3>
        </div>
        {description && (
          <p className="text-sm text-[#8181A5] mt-1">{description}</p>
        )}
      </div>

      <div className="p-5">
        {/* Input fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-medium text-[#8181A5] mb-1.5">
                {field.label}
              </label>
              <div className="relative">
                {field.prefix && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8181A5]">
                    {field.prefix}
                  </span>
                )}
                <input
                  type="number"
                  value={values[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  min={field.min}
                  max={field.max}
                  step={field.step ?? 1}
                  className={`w-full h-10 rounded-lg border border-[#ECECF2] text-sm text-[#1C1D21] focus:outline-none focus:ring-2 focus:ring-[${color}]/30 focus:border-[${color}] transition-colors ${
                    field.prefix ? "pl-7 pr-3" : "px-3"
                  } ${field.suffix ? "pr-12" : ""}`}
                />
                {field.suffix && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#8181A5]">
                    {field.suffix}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Result */}
        <div className="rounded-lg p-4" style={{ background: `${color}08` }}>
          <div className="text-xs font-medium text-[#8181A5] mb-1">{result.label}</div>
          <div className="text-2xl font-black text-[#1C1D21]">
            {result.prefix}{formatted}{result.suffix}
          </div>
        </div>

        {/* CTA */}
        <p className="text-xs text-[#8181A5] mt-3">
          Want to model this over 36 months with scenarios?{" "}
          <a href="/auth/register" className="font-medium hover:underline" style={{ color }}>
            Try Revenue Map free →
          </a>
        </p>
      </div>
    </div>
  );
}
