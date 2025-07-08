"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [whatsappLink, setWhatsappLink] = useState('');

  useEffect(() => {
    const message = `I want to buy ${product.description} for ${product.price}.`;
    const encodedMessage = encodeURIComponent(message);
    setWhatsappLink(`https://wa.me/${product.sellerId}?text=${encodedMessage}`);
  }, [product]);
  
  return (
    <Card className="w-full overflow-hidden flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
      <div className="aspect-square relative">
        <Image
          src={product.image}
          alt={product.description}
          fill
          className="object-cover"
          data-ai-hint="product image"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-semibold text-lg line-clamp-2">{product.description}</h3>
        <p className="text-primary font-bold text-xl mt-2">{product.price}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat to Buy
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
