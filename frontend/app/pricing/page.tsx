'use client';

import { useState } from 'react';
import { Navbar } from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaCheck, FaTimes } from "react-icons/fa";
import Link from "next/link";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Choose the plan that fits your needs. Upgrade or downgrade at any time.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex justify-center items-center gap-4">
              <Tabs defaultValue="monthly" className="w-[400px]" onValueChange={(v: 'monthly' | 'yearly') => setBillingCycle(v)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">
                    Yearly <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">-17%</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="flex flex-col border-2 hover:border-primary/50 transition-all">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>For casual users</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-500" /> <span>Basic Audio Tools (Trim)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-500" /> <span>Basic Image Tools (Crop)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-500" /> <span>5 Conversions per day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-500" /> <span>Standard Quality</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <FaTimes /> <span>No Speed Control</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <FaTimes /> <span>No Batch Processing</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="flex flex-col border-2 border-primary relative shadow-lg scale-105 z-10">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
                POPULAR
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>For power users</CardDescription>
                <div className="mt-4">
                  {billingCycle === 'monthly' ? (
                    <>
                      <span className="text-4xl font-bold">$9.99</span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">$99</span>
                      <span className="text-muted-foreground">/year</span>
                      <div className="text-sm text-green-600 font-medium mt-1">Save $20.88 per year</div>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-500" /> <span>All Audio Tools (Speed, etc.)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-500" /> <span>All Video Tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-500" /> <span>Unlimited Conversions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-500" /> <span>High Quality (200 DPI+)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-500" /> <span>Batch Processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-500" /> <span>Priority Support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full font-bold" size="lg" asChild>
                  <Link href={`/signup?plan=pro&billing=${billingCycle}`}>
                    Upgrade to Pro
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-2">Can I cancel anytime?</h3>
                <p className="text-muted-foreground">Yes, you can cancel your subscription at any time. You'll keep access until the end of your billing period.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Is there a free trial for Pro?</h3>
                <p className="text-muted-foreground">We offer a 7-day money-back guarantee if you're not satisfied with the Pro plan.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">We accept all major credit cards, PayPal, and Apple Pay.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-muted/20">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl">DailyTools</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 DailyTools. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
