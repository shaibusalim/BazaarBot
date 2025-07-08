import { ProductCard } from '@/components/product-card';
import { getProductsBySeller } from '@/lib/mock-data';
import type { Product } from '@/types';
import { Bot, Store } from 'lucide-react';
import Link from 'next/link';

export default async function SellerPage({ params }: { params: { sellerId: string } }) {
  const products: Product[] = await getProductsBySeller(params.sellerId);

  const formattedSellerId = `+${params.sellerId.slice(0, 3)} ${params.sellerId.slice(3, 5)} ${params.sellerId.slice(5, 8)} ${params.sellerId.slice(8)}`;

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <header className="py-4 px-4 md:px-6 bg-card/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <div className="container mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <Bot className="text-primary" size={28} />
                <h1 className="text-2xl font-bold font-headline tracking-tight">
                    BazaarBot
                </h1>
            </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="text-center mb-12">
          <Store className="mx-auto text-primary h-12 w-12" />
          <h2 className="text-3xl font-bold font-headline tracking-tight mt-4">
            Seller's Store
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            Products from {formattedSellerId}
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-lg">
            <p className="text-2xl font-semibold text-muted-foreground">This shop is empty!</p>
            <p className="text-muted-foreground mt-2">The seller has not added any products yet.</p>
          </div>
        )}
      </main>
        <footer className="py-6 border-t mt-12">
            <div className="container mx-auto px-4 sm:px-6 text-center text-muted-foreground text-sm">
            <p>Powered by BazaarBot. Create your own store via WhatsApp.</p>
            </div>
      </footer>
    </div>
  );
}
