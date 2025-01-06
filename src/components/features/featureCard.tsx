import { motion } from "motion/react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

export default function FeatureCard({
  title,
  description,
  icon,
}: FeatureCardProps) {
  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 fade-in"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}
