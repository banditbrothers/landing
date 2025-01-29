import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";

interface TestimonialCardProps {
  name: string;
  quote: string;
  image: string;
}

export default function TestimonialCard({ name, quote, image }: TestimonialCardProps) {
  return (
    <motion.div
      className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 fade-in"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}>
      <div className="flex items-center mb-4">
        <Avatar className="mr-4 h-12 w-12">
          <AvatarImage src={image} asChild>
            <Image fill src={image} alt={name + " profile image"} className="h-full w-full object-cover" />
          </AvatarImage>
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-foreground">{name}</h3>
      </div>
      <p className="text-muted-foreground italic">&quot;{quote}&quot;</p>
    </motion.div>
  );
}
