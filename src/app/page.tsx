import Link from "next/link";
import { Bot, Link as LinkIcon, MessageSquarePlus, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2">
          <Bot className="text-primary" size={28} />
          <h1 className="text-2xl font-bold font-headline tracking-tight">
            BazaarBot
          </h1>
        </div>
      </header>
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold font-headline text-primary tracking-tighter">
              Sell on WhatsApp, Instantly.
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
              BazaarBot turns your WhatsApp into a powerful e-commerce store. Add products with a simple message and get a shareable online catalog for your customers in Ghana.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/233123456789">
                  <Store className="mr-2" /> View Demo Store
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold font-headline">How It Works</h3>
              <p className="text-muted-foreground mt-2">Three simple steps to start selling.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-accent/20 text-accent-foreground p-3 rounded-full w-fit">
                    <MessageSquarePlus size={32} />
                  </div>
                  <CardTitle className="mt-4">1. Add Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Send a message from WhatsApp with your product image, price, and description. It's that easy.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-accent/20 text-accent-foreground p-3 rounded-full w-fit">
                    <LinkIcon size={32} />
                  </div>
                  <CardTitle className="mt-4">2. Share Your Store</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>We instantly generate a beautiful, mobile-friendly catalog page for your business.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-accent/20 text-accent-foreground p-3 rounded-full w-fit">
                    <Store size={32} />
                  </div>
                  <CardTitle className="mt-4">3. Start Selling</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Customers browse your products and tap "Chat to Buy" to start an order directly on WhatsApp.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </main>

      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 sm:px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BazaarBot. Made for Ghanaian Entrepreneurs.</p>
        </div>
      </footer>
    </div>
  );
}
