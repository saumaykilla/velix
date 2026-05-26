import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'font-body-md text-on-primary font-semibold py-3 px-4 rounded-lg w-full mt-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none';

  const variantClasses = {
    primary: 'gradient-btn shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)]',
    secondary: 'bg-surface-container border border-primary-container/10 text-primary hover:bg-surface-container-high',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
export default Button;
