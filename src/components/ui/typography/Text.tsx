type TextProp = {
  text: string;
  className?: string;
};

const Text = ({ text, className }: TextProp) => {
  return <p className={`${className} text-sm font-semibold whitespace-nowrap flex-shrink-0`}>{text}</p>;
};

const Span = ({ text, className }: TextProp) => {
  return <span className={`${className} text-xs truncate`}>{text}</span>;
}


export {
  Text,
  Span,
};
