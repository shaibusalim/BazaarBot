'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function TesterPage() {
  const [sellerId, setSellerId] = useState('233123456789');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<object | null>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiResponse(null);

    let photoDataUri: string | undefined = undefined;

    if (imageFile) {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = async () => {
        photoDataUri = reader.result as string;
        await sendMessage(photoDataUri);
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        toast({
          variant: 'destructive',
          title: 'File Read Error',
          description: 'Could not read the selected image file.',
        });
        setLoading(false);
      };
    } else {
      await sendMessage();
    }
  };

  const sendMessage = async (photoDataUri?: string) => {
    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, message, photoDataUri }),
      });

      const result = await response.json();
      setApiResponse(result);

      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setApiResponse({ error: errorMessage });
      toast({
        variant: 'destructive',
        title: 'API Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Webhook Simulator</CardTitle>
              <CardDescription>
                Test the `/api/whatsapp` endpoint by simulating messages from sellers and buyers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sellerId">Sender Phone Number (Seller/Buyer ID)</Label>
                  <Input
                    id="sellerId"
                    value={sellerId}
                    onChange={(e) => setSellerId(e.target.value)}
                    placeholder="e.g., 233123456789"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter message... (e.g., 'Selling this for ₵150' or 'Is this available?')"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image (Optional - for adding products)</Label>
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>

              {apiResponse && (
                <div className="mt-8">
                  <h3 className="font-semibold mb-2">API Response:</h3>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
