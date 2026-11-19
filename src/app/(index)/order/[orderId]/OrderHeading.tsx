/** The big "{head} {accent}." title and intro line shared by the order and review pages */
export const OrderHeading = ({ head, accent, copy }: { head: string; accent: string; copy: React.ReactNode }) => (
  <>
    <h1 className="font-calera uppercase leading-[0.9] text-[17vw] md:text-[clamp(4.5rem,9vw,8rem)]">
      {head} <span className="text-bandit-orange">{accent}</span>.
    </h1>
    <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md mt-5">{copy}</p>
  </>
);
