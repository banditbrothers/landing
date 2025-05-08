import { motion } from "motion/react";
import { scrollTo } from "@/utils/misc";
import { Button } from "@/components/ui/button";

// const uploadVariantImages = async () => {
//   try {
//     // Define the bucket name from environment variable
//     const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "";
//     if (!bucketName) {
//       toast.error("S3 bucket not configured");
//       return;
//     }

//     // Example: Upload a specific webp image from public directory
//     // You can modify this to handle multiple images or different paths

//     for (const design of DESIGNS) {
//       const imageName = `${design.id}.webp`; // Image in public folder
//       const s3Key = `bandana/${design.id}/mockup.webp`; // Path in S3

//       // toast.loading("Uploading image...");
//       await uploadImage(imageName, s3Key, bucketName, design.id);
//     }

//     toast.success("All images uploaded successfully");
//   } catch (error) {
//     console.error("Failed to upload images:", error);
//     toast.error("Failed to upload images");
//   }
// };

export const HeroSection = () => {
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      <video autoPlay muted loop playsInline className="absolute z-0 w-full h-full object-cover">
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <div className="container mx-auto px-4 z-20 text-center">
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}>
          Wear Your Mischief
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl mb-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}>
          Experience ultimate comfort and look your style with Bandit Brothers
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}>
          <Button size="lg" variant="bandit-hover" onClick={() => scrollTo("library")}>
            Be A Bandit
          </Button>
        </motion.div>
      </div>

      {/* <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent to-black" /> */}
    </section>
  );
};
