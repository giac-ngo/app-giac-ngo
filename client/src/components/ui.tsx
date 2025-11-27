// client/src/components/ui.tsx
import React from 'react';

// A simple Button component
export const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  [x: string]: any; // for other props like onClick, data-testid
}> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = "font-serif font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  const sizeClasses = size === 'sm' ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const variantClasses = variant === 'primary' 
    ? "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary"
    : "bg-card border border-border text-foreground hover:bg-sidebar focus:ring-primary";

  return (
    <button className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

// A simple Card component
export const Card: React.FC<{ children: React.ReactNode; className?: string; [x: string]: any; }> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-card border border-border rounded-xl shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

// A simple Input component
export const Input: React.FC<{
  className?: string;
  [x: string]: any;
}> = ({ className = '', ...props }) => {
  return (
    <input
      className={`block w-full px-3 py-2 bg-card border border-border rounded-lg shadow-sm focus:ring-primary focus:border-primary ${className}`}
      {...props}
    />
  );
};

// A simple Checkbox component
export const Checkbox: React.FC<{
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  [x: string]: any;
}> = ({ id, checked, onCheckedChange, ...props }) => {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
      {...props}
    />
  );
};

// A simple Badge component
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  [x: string]: any;
}> = ({ children, variant = 'secondary', className = '', ...props }) => {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-sidebar border border-border text-foreground',
    destructive: 'bg-red-500 text-white',
    outline: 'border border-border text-foreground',
  };
  
  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
