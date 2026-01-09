import React from 'react';

type TextProps = {
  text?: string;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'muted';
  children?: React.ReactNode;
};

const Text: React.FC<TextProps> = ({ text, className, variant = 'default', children }) => {
  const variantClass = variant === 'muted' ? 'text-gray-600' : '';
  
  return (
    <p
      className={`${variantClass} ${className} text-sm font-semibold whitespace-nowrap flex-shrink-0`}
    >
      {children || text}
    </p>
  );
};

const Span: React.FC<TextProps> = ({ text, className, style }) => {
  return (
    <span
      className={`${className} text-xs truncate`}
      style={style}
    >
      {text}
    </span>
  );
};

export {
  Text,
  Span,
};
