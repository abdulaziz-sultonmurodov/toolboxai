'use client';

import { Navbar } from "./components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FaMusic, FaVideo, FaImage, FaExchangeAlt, FaMagic, FaRocket, FaShieldAlt } from "react-icons/fa";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-violet-500/5 to-background -z-10" />
        <div className="container px-4 mx-auto text-center relative z-10">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            New: PDF to Image Converter
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            Master Your Digital Life <br /> with Premium Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A complete suite of AI-powered tools for audio, video, and image processing. 
            Simple, fast, and secure. No installation required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="font-bold text-lg h-12 px-8 rounded-full shadow-lg shadow-primary/20 transition-transform hover:scale-105" asChild>
              <Link href="/signup">Get Started for Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="font-bold text-lg h-12 px-8 rounded-full hover:bg-secondary/50" asChild>
              <Link href="#features">Explore Features</Link>
            </Button>
          </div>
          
          {/* Stats/Trust */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center opacity-70">
            <div>
              <h3 className="text-3xl font-bold">10k+</h3>
              <p className="text-sm text-muted-foreground">Users</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold">50k+</h3>
              <p className="text-sm text-muted-foreground">Files Processed</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold">99.9%</h3>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold">4.9/5</h3>
              <p className="text-sm text-muted-foreground">Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to handle your media files with precision and speed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Audio Tools */}
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                  <FaMusic className="text-pink-500 text-xl" />
                </div>
                <CardTitle>Audio Studio</CardTitle>
                <CardDescription>Professional audio manipulation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">✓ Smart Trimming</li>
                  <li className="flex items-center">✓ Speed Control</li>
                  <li className="flex items-center">✓ Format Conversion</li>
                  <li className="flex items-center">✓ Noise Reduction</li>
                </ul>
              </CardContent>
            </Card>

            {/* Video Tools */}
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                  <FaVideo className="text-violet-500 text-xl" />
                </div>
                <CardTitle>Video Editor</CardTitle>
                <CardDescription>Quick video enhancements</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">✓ Remove Audio</li>
                  <li className="flex items-center">✓ Crop & Resize</li>
                  <li className="flex items-center">✓ Apply Filters</li>
                  <li className="flex items-center">✓ Compression</li>
                </ul>
              </CardContent>
            </Card>

            {/* Image Tools */}
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-4">
                  <FaImage className="text-cyan-500 text-xl" />
                </div>
                <CardTitle>Image Lab</CardTitle>
                <CardDescription>Advanced image processing</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">✓ Smart Crop</li>
                  <li className="flex items-center">✓ Filter Gallery</li>
                  <li className="flex items-center">✓ Resize & Compress</li>
                  <li className="flex items-center">✓ Background Removal</li>
                </ul>
              </CardContent>
            </Card>

            {/* Converter Tools */}
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background/50 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                  <FaExchangeAlt className="text-orange-500 text-xl" />
                </div>
                <CardTitle>Converter</CardTitle>
                <CardDescription>Universal file conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">✓ Image to PDF</li>
                  <li className="flex items-center">✓ PDF to Image</li>
                  <li className="flex items-center">✓ PDF to SVG</li>
                  <li className="flex items-center">✓ Batch Processing</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to perfection</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-background border-4 border-muted flex items-center justify-center mb-6 shadow-lg">
                <FaMagic className="text-3xl text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Choose Tool</h3>
              <p className="text-muted-foreground">Select from our wide range of audio, video, and image tools.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-background border-4 border-muted flex items-center justify-center mb-6 shadow-lg">
                <FaRocket className="text-3xl text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Upload & Edit</h3>
              <p className="text-muted-foreground">Upload your file and apply the desired changes instantly.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-background border-4 border-muted flex items-center justify-center mb-6 shadow-lg">
                <FaShieldAlt className="text-3xl text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Download</h3>
              <p className="text-muted-foreground">Get your processed file immediately. Secure and fast.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 text-xl mb-10">
            Join thousands of users who trust DailyTools for their media processing needs.
          </p>
          <Button size="lg" variant="secondary" className="font-bold text-lg h-14 px-10 rounded-full shadow-xl" asChild>
            <Link href="/signup">Create Free Account</Link>
          </Button>
          <p className="mt-6 text-sm text-primary-foreground/60">No credit card required for free plan.</p>
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
