import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const TestimonialsSection = () => {
  return (
    <section id="reviews" className="py-20 bg-background text-foreground scroll-mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Looking for reviews?</h2>
          <p className="text-muted-foreground mb-6">Discover what other Bandits are saying about their experience</p>
          <Link href="/reviews">
            <Button variant="default" className="group">
              View all reviews
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
