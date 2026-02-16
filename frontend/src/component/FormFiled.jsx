import React from "react";

// ------------------ Reusable TextInput ------------------
export function TextInput({
  label,         // Label text
  name,          // Input name
  type = "text", // Input type
  placeholder,   // Placeholder text
  value,         // Input value
  onChange,      // onChange handler
  readOnly = false,
  step,          // For number input
  min,           // For number input
  rows,          // For textarea
  error,         // Error message
}) {
  const isTextArea = rows !== undefined;

  return (
    <div className="w-full">
      {label && <p className="text-xs mb-1 text-slate-600">{label}</p>}

      {isTextArea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          className="
            w-full border rounded-lg px-3 py-2
            text-slate-800 placeholder:text-slate-400
            border-slate-300 focus:ring-1 focus:ring-blue-500
            outline-none resize-none
          "
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          step={step}
          min={min}
          className="
            w-full border rounded-lg px-3 py-2 text-slate-800
            placeholder:text-slate-400 border-slate-300
            outline-none focus:ring-1 focus:ring-blue-500 bg-white
          "
        />
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ------------------ Reusable Button ------------------
export function Button({
  children,
  onClick,
  type = "button",
  icon,
  disabled = false,
  className = "",
  full = false,          // ✅ add this
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white",
        "bg-blue-600 hover:brightness-95 disabled:opacity-60 transition",
        full ? "w-full justify-center" : "inline-flex", // ✅ full width like input
        className,
      ].join(" ")}
    >
      {icon && icon} {children}
    </button>
  );
}
