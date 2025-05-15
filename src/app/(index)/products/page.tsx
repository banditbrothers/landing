import { PRODUCTS, PRODUCTS_OBJ } from "@/data/products";
import { Product } from "@/types/product";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { formatCurrency } from "@/utils/price";
import Link from "next/link";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Link href={`/products/${product.id}`} className="block w-full h-full">
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl h-full relative transform hover:-translate-y-1 cursor-pointer">
        {/* Product Image Container */}
        <div className="relative bg-muted dark:bg-muted overflow-hidden">
          <AspectRatio ratio={1 / 1}>
            {product.baseImages?.mockup?.[0] ? (
              <Image
                fill
                src={product.baseImages.mockup[0]}
                alt={product.name}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted dark:bg-muted">
                <span className="text-muted-foreground dark:text-muted-foreground">No image available</span>
              </div>
            )}

            {/* Price Tag */}
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium">
              {formatCurrency(product.basePrice)}
            </div>
          </AspectRatio>
        </div>

        {/* Product Info */}
        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
          <CardDescription className="line-clamp-2">{product.description}</CardDescription>
        </CardHeader>

        <CardContent className="pb-4 pt-0">
          {/* Product Details */}
          <div className="space-y-1 text-xs text-muted-foreground dark:text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">Material:</span>
              <span>{product.material}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Dimensions:</span>
              <span>{product.dimensions}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto mt-32 min-h-screen">
      <div className="px-4">
        <div className="flex flex-col gap-2 items-center justify-center my-16">
          <h1 className="text-4xl font-bold text-center text-foreground dark:text-foreground">Our Collection</h1>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {PRODUCTS.map(product => (
            <div className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)]" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
