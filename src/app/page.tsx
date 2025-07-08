'use client'; // This component now uses hooks, so it must be a client component

import Link from "next/link";
import Image from "next/image";
import { Bot, Link as LinkIcon, MessageSquarePlus, Store, Sparkles, Zap, ShoppingBag, Share2, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { generateImage } from "@/ai/flows/generate-image-flow";
import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function Home() {
  const [imageUris, setImageUris] = useState<string[]>([
    "https://placehold.co/500x550.png",
    "https://placehold.co/500x550.png",
    "https://placehold.co/500x550.png",
  ]);

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  useEffect(() => {
    async function fetchImages() {
      const prompts = [
        "A vibrant and professional-looking smartphone screen displaying a mobile e-commerce app. The app shows a grid of colorful, handmade Ghanaian products like Kente cloth and beaded jewelry. The app has a clean, modern design with purple and blue accents. The phone is held by a person, with a blurred background of a bustling Ghanaian market, conveying a sense of local entrepreneurship powered by technology.",
        "A smartphone screen showcasing an elegant, locally-made fashion item from a Ghanaian designer on the BazaarBot app. The product is a colorful dress with intricate patterns. The background is a minimalist, well-lit studio, making the product pop.",
        "A smartphone screen displaying a delicious plate of Jollof rice with chicken from a local Ghanaian food vendor on the BazaarBot app. The photo is vibrant and appetizing, with a blurred background of a cozy restaurant setting."
      ];
      try {
        const imagePromises = prompts.map(prompt => generateImage({ prompt }));
        const results = await Promise.all(imagePromises);
        setImageUris(results.map(result => result.imageDataUri));
      } catch (error) {
        console.error("AI image generation failed. This may be due to a missing GOOGLE_API_KEY. Using placeholders. Error:", error);
        // Placeholders are already set, no need to do anything.
      }
    }
    fetchImages();
  }, []);


  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <header className="py-4 px-4 md:px-6 sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Bot className="text-primary" size={28} />
            <h1 className="text-xl md:text-2xl font-bold font-headline tracking-tight whitespace-nowrap">
              BazaarBot
            </h1>
          </Link>
          <Button asChild className="flex-shrink-0">
            <Link href="/233123456789">
              <span className="hidden sm:inline">View Demo Store</span>
              <span className="sm:hidden">Demo</span>
              <MoveRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.1),transparent_70%)] -z-10"></div>
          <div className="container mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[200%_auto] animate-text-gradient tracking-tighter leading-tight">
                Instantly Turn WhatsApp into Your Online Store.
              </h2>
              <p className="mt-6 max-w-xl text-lg md:text-xl text-muted-foreground" style={{ animationDelay: '0.2s' }}>
                BazaarBot helps Ghanaian sellers create a beautiful online catalog just by sending a WhatsApp message. No apps, no websites, no fees.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4" style={{ animationDelay: '0.4s' }}>
                <Button size="lg" asChild className="shadow-lg shadow-primary/30 transition-all hover:shadow-primary/50 hover:-translate-y-1">
                  <Link href="/233123456789">
                    <Store className="mr-2" /> See a Live Store
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <Link href="#how-it-works">
                    Learn More <MoveRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-in-up [animation-delay:0.2s] p-4">
                <Carousel
                  plugins={[plugin.current]}
                  className="w-full max-w-md mx-auto"
                  opts={{ loop: true }}
                >
                  <CarouselContent>
                    {imageUris.map((uri, index) => (
                      <CarouselItem key={index}>
                          <Image
                            src={uri}
                            alt={`BazaarBot store showcase ${index + 1}`}
                            width={500}
                            height={550}
                            className="rounded-xl shadow-2xl object-cover w-full h-auto"
                            data-ai-hint="phone store app"
                          />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-20 md:py-28 bg-primary/[0.03] border-y border-primary/10">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-16 animate-fade-in-up">
              <span className="text-primary font-semibold uppercase tracking-wider">Simple Steps</span>
              <h3 className="text-3xl md:text-4xl font-bold font-headline mt-2">Start Selling in Seconds</h3>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">From your phone to a full-fledged store in three simple steps.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center shadow-[0_0_20px_0px_hsl(var(--primary)/0.4)] transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-8">
                  <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-6">
                    <MessageSquarePlus size={32} />
                  </div>
                  <h4 className="text-xl font-semibold">1. Send a Message</h4>
                  <p className="text-muted-foreground mt-2">Snap a photo, add a price & description, and send it to our WhatsApp number. That's it.</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-[0_0_20px_0px_hsl(var(--primary)/0.4)] transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <CardContent className="p-8">
                  <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-6">
                    <LinkIcon size={32} />
                  </div>
                  <h4 className="text-xl font-semibold">2. Get Your Link</h4>
                  <p className="text-muted-foreground mt-2">We instantly create a beautiful, public store page for you and send you the link.</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-[0_0_20px_0px_hsl(var(--primary)/0.4)] transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                 <CardContent className="p-8">
                  <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-6">
                    <Share2 size={32} />
                  </div>
                  <h4 className="text-xl font-semibold">3. Share & Sell</h4>
                  <p className="text-muted-foreground mt-2">Share your store link with customers on WhatsApp, social media, or anywhere you like!</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-16 animate-fade-in-up">
                    <span className="text-primary font-semibold uppercase tracking-wider">All-in-One Platform</span>
                    <h3 className="text-3xl md:text-4xl font-bold font-headline mt-2">Everything You Need to Sell</h3>
                    <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Powerful features designed to make selling simple and fast.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <Card className="shadow-[0_0_20px_0px_hsl(var(--primary)/0.4)] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <CardHeader className="items-center text-center">
                             <div className="p-3 bg-primary/10 rounded-full mb-4">
                                <Zap className="h-7 w-7 text-primary" />
                            </div>
                            <CardTitle>Instant Setup</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            No registration. Your WhatsApp number is your account.
                        </CardContent>
                    </Card>
                    <Card className="shadow-[0_0_20px_0px_hsl(var(--primary)/0.4)] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <CardHeader className="items-center text-center">
                            <div className="p-3 bg-primary/10 rounded-full mb-4">
                                <ShoppingBag className="h-7 w-7 text-primary" />
                            </div>
                            <CardTitle>Unlimited Products</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            Add as many products as you want to your online catalog.
                        </CardContent>
                    </Card>
                    <Card className="shadow-[0_0_20px_0px_hsl(var(--primary)/0.4)] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                        <CardHeader className="items-center text-center">
                            <div className="p-3 bg-primary/10 rounded-full mb-4">
                                <Sparkles className="h-7 w-7 text-primary" />
                            </div>
                            <CardTitle>AI-Powered</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            Our AI automatically understands your product details.
                        </CardContent>
                    </Card>
                    <Card className="shadow-[0_0_20px_0px_hsl(var(--primary)/0.4)] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
                        <CardHeader className="items-center text-center">
                            <div className="p-3 bg-primary/10 rounded-full mb-4">
                                <Share2 className="h-7 w-7 text-primary" />
                            </div>
                            <CardTitle>Easily Shareable</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            A clean, simple link to your store that you can share anywhere.
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
      </main>

      <footer className="py-8 border-t bg-primary/[0.03] border-t-primary/10">
        <div className="container mx-auto px-4 sm:px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BazaarBot. Empowering Ghanaian Entrepreneurs.</p>
        </div>
      </footer>
    </div>
  );
}
