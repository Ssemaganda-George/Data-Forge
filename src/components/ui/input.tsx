import { cn } from "@/lib/utils";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
  passwordVisible?: boolean;
  onTogglePassword?: () => void;
}

export function Input({
  label,
  error,
  className,
  id,
  showPasswordToggle,
  passwordVisible,
  onTogglePassword,
  ...props
}: InputProps) {
  const isPasswordField =
    props.type === "password" || props.type === "text";

  const icon = passwordVisible ? (
    <IconEyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
  ) : (
    <IconEye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
  );

  const inputElement = (
    <input
      id={id}
      className={cn(
        "input",
        error && "border-red-400 focus:ring-red-400",
        showPasswordToggle && isPasswordField && "pr-10",
        className
      )}
      {...props}
    />
  );

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      {showPasswordToggle && isPasswordField ? (
        <div className="relative">
          {inputElement}
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            tabIndex={-1}
          >
            {icon}
          </button>
        </div>
      ) : (
        inputElement
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={4}
        className={cn("input resize-none", error && "border-red-400", className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
