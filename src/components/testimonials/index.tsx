import { testimonials } from "@/data/testimonials";
import TestimonialCard from "./testimonialCard";

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-gray-50 scroll-mt-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">
          What Our Riders Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};
