import { SkeletonImage } from "@/components/misc/SkeletonImage";
import { knowYourProduct } from "@/data/know-your-product";
import { Reveal, SectionHead } from "@/components/misc/Reveal";

export const KnowYourProductSection = () => {
  return (
    <section id="know-your-product" className="max-w-screen-2xl mx-auto px-4 md:px-8">
      <SectionHead
        kicker="Know your product"
        title={
          <>
            Built <span className="text-bandit-orange">different</span>
          </>
        }
      />

      <div className="grid md:grid-cols-3 gap-4 md:gap-5">
        {knowYourProduct.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.1}>
            <article className="group h-full rounded-3xl border border-border bg-card overflow-hidden transition hover:border-bandit-orange/60">
              <div className="relative aspect-[4/3] overflow-hidden">
                <SkeletonImage
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute left-4 bottom-1 font-calera text-7xl leading-none text-transparent [-webkit-text-stroke:1.5px_theme(colors.bandit-orange)]">
                  0{i + 1}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-calera uppercase text-3xl mb-3">{item.title}</h3>
                <details className="group/d text-muted-foreground leading-relaxed">
                  <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                    {item.description}
                    <span className="group-open/d:hidden">… </span>
                    <span className="text-bandit-orange whitespace-nowrap group-open/d:hidden">read more</span>
                  </summary>
                  <p className="mt-0">{item.extendedDescription}</p>
                </details>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
