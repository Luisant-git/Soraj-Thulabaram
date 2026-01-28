import React from "react";

export default function TextInput({
  name,
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
  error,
  rows,
  showToggle,
  onToggle,
  toggleIconOn,
  toggleIconOff,
}) {
  const isTextArea = rows !== undefined;

  return (
    <div className="w-full">
      <label className="flex items-center gap-2 text-sm text-slate-600 w-full">
        {icon && <span className="text-slate-500">{icon}</span>}

        {isTextArea ? (
          <textarea
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
            className="
              flex-1 px-3 py-2
              border border-slate-300 rounded-lg
              text-slate-800 placeholder:text-slate-400
              outline-none bg-transparent
              focus:ring-1 focus:ring-blue-500
              resize-none
            "
          />
        ) : (
          <div className="flex items-center w-full border border-slate-300 rounded-lg bg-transparent focus-within:ring-1 focus-within:ring-blue-500">
            {/* INPUT */}
            <input
              name={name}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              className="
                flex-1 px-3 py-2
                text-slate-800 placeholder:text-slate-400
                outline-none bg-transparent
              "
            />

            {/* RIGHT ICON SPACE (always same width) */}
            <div className="w-10 flex items-center justify-center">
              {showToggle && (
                <button
                  type="button"
                  onClick={onToggle}
                  className="text-slate-500 hover:text-slate-700"
                >
                  {type === "password" ? toggleIconOff : toggleIconOn}
                </button>
              )}
            </div>
          </div>
        )}
      </label>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
