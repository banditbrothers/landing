// Calera caps average ~0.68em per letter; 0.72 leaves room for wide ones (M, W)
const EM_PER_CHAR = 0.72;

/**
 * Display title that shrinks until its longest word fits the column.
 * Words may wrap onto new lines; letters of a word never do.
 */
export const FitTitle = ({
  as: Tag = "h2",
  text,
  max,
  className = "",
  children,
}: {
  as?: "h1" | "h2" | "h3";
  /** Plain text used to find the longest word (defaults to children when it's a string) */
  text: string;
  /** Upper bound, any CSS length */
  max: string;
  className?: string;
  children?: React.ReactNode;
}) => {
  const longest = Math.max(...text.split(/\s+/).map(w => w.length));
  return (
    <div className="[container-type:inline-size]">
      <Tag className={className} style={{ fontSize: `min(${max}, calc(100cqi / ${(longest * EM_PER_CHAR).toFixed(2)}))` }}>
        {children ?? text}
      </Tag>
    </div>
  );
};
