type TextProp = {
  text?: string;
  className?: string;
  style?: React.CSSProperties;
};

const Text = ({ text, className }: TextProp) => {
  return (
    <p
      className={`${className} text-sm font-semibold whitespace-nowrap flex-shrink-0`}
    >
      {text}
    </p>
  );
};

const Span = ({ text, className, style }: TextProp) => {
  return (
    <span
      className={`${className} text-xs truncate`}
      style={style}
    >
      {text}
    </span>
  );
}

export {
  Text,
  Span,
};
