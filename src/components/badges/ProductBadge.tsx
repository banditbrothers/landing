export function ProductBadge(props: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
      {props.children}
    </span>
  );
}
