import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  rightElement?: React.ReactNode;
  containerClassName?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, rightElement, containerClassName = '', className = '', id, error, ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor={id}>
            {label}
          </label>
        )}
        <div className="relative input-focus-glow rounded-lg transition-shadow duration-200">
          {icon && (
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none select-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={`w-full bg-surface-container-lowest border ${
              error ? 'border-error' : 'border-primary-container/15'
            } rounded-lg py-2.5 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant/40 focus:border-primary-container focus:ring-4 focus:ring-primary-container/20 transition-all outline-none ${
              icon ? 'pl-10' : 'pl-3'
            } ${rightElement ? 'pr-10' : 'pr-3'} ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs font-semibold text-error mt-0.5 flex items-center gap-1 select-none">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
