interface FieldWrapperProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

function FieldWrapper({ label, error, children, htmlFor }: FieldWrapperProps): React.JSX.Element {
  return (
    <label className="flex flex-col gap-1" htmlFor={htmlFor}>
      <span className="font-meta text-xs uppercase tracking-wide text-ink/60">{label}</span>
      {children}
      {error && <span className="font-body text-xs text-paprika">{error}</span>}
    </label>
  );
}

const inputClass =
  "border border-clay-line bg-parchment px-3 py-2 font-body text-sm text-ink focus-visible:outline-2 focus-visible:outline-turmeric";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function TextField({ label, value, onChange, error, placeholder }: TextFieldProps): React.JSX.Element {
  return (
    <FieldWrapper label={label} error={error}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </FieldWrapper>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  rows?: number;
}

export function TextArea({ label, value, onChange, error, rows = 3 }: TextAreaProps): React.JSX.Element {
  return (
    <FieldWrapper label={label} error={error}>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-y`}
      />
    </FieldWrapper>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  min?: number;
}

export function NumberField({ label, value, onChange, error, min }: NumberFieldProps): React.JSX.Element {
  return (
    <FieldWrapper label={label} error={error}>
      <input
        type="number"
        value={Number.isFinite(value) ? value : ""}
        min={min}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className={inputClass}
      />
    </FieldWrapper>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
}

export function SelectField({ label, value, onChange, options, error }: SelectFieldProps): React.JSX.Element {
  return (
    <FieldWrapper label={label} error={error}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxRow({ label, checked, onChange }: CheckboxRowProps): React.JSX.Element {
  return (
    <label className="flex items-center gap-2 font-body text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-turmeric focus-visible:outline-2 focus-visible:outline-turmeric"
      />
      {label}
    </label>
  );
}

interface ChipToggleGroupProps {
  legend: string;
  options: Array<{ value: string; label: string }>;
  active: string[];
  onChange: (values: string[]) => void;
  error?: string;
}

export function ChipToggleGroup({ legend, options, active, onChange, error }: ChipToggleGroupProps): React.JSX.Element {
  const toggle = (value: string): void => {
    onChange(active.includes(value) ? active.filter((v) => v !== value) : [...active, value]);
  };
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-meta text-xs uppercase tracking-wide text-ink/60">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = active.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => toggle(option.value)}
              className={`border px-3 py-1 font-body text-sm transition-colors focus-visible:outline-2 focus-visible:outline-turmeric ${
                isActive ? "border-accent-1 bg-accent-1/10 text-ink" : "border-clay-line text-ink/70 hover:border-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error && <span className="font-body text-xs text-paprika">{error}</span>}
    </fieldset>
  );
}
