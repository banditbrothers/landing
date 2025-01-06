import { features } from "@/data/features";
import FeatureCard from "./featureCard";
export const Features = () => {
  return (
    <section id="features" className="py-20 bg-gray-50 scroll-mt-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">
          Why Bikers Love Bandit Brothers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};
