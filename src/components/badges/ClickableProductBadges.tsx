import Link from "next/link";

export function ClickableProductBadge(props: { children: React.ReactNode; productId: string }) {
  return (
    <Link href={`/designs/${props.productId}`}>
      <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 hover:bg-bandit-orange/10 hover:text-bandit-orange hover:ring-bandit-orange/20 transition-colors">
        {props.children}
      </span>
    </Link>
  );
}
