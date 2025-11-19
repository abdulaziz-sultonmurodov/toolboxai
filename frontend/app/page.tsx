'use client';

import { Navbar } from "./components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FaMusic, FaVideo, FaImage } from "react-icons/fa";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
          All Your Daily Tools <br /> in One Place
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Enhance your productivity with our suite of premium audio, video, and image tools. 
          Powered by AI, designed for you.
        </p>
        <div className="flex gap-4">
          <Button size="lg" className="font-semibold">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="font-semibold">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Audio Tools */}
          <Card>
            <CardHeader>
              <p className="text-xs uppercase font-bold text-pink-500">Audio</p>
              <CardTitle>Audio Studio</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[150px]">
              <FaMusic size={64} className="text-muted-foreground" />
              <p className="mt-4 text-center text-muted-foreground">Trim, Speed Up, Enhance</p>
            </CardContent>
          </Card>

          {/* Video Tools */}
          <Card>
            <CardHeader>
              <p className="text-xs uppercase font-bold text-violet-500">Video</p>
              <CardTitle>Video Editor</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[150px]">
              <FaVideo size={64} className="text-muted-foreground" />
              <p className="mt-4 text-center text-muted-foreground">Remove Sound, Crop, Filter</p>
            </CardContent>
          </Card>

          {/* Image Tools */}
          <Card>
            <CardHeader>
              <p className="text-xs uppercase font-bold text-cyan-500">Image</p>
              <CardTitle>Image Lab</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[150px]">
              <FaImage size={64} className="text-muted-foreground" />
              <p className="mt-4 text-center text-muted-foreground">Crop, Filter, Resize</p>
            </CardContent>
          </Card>

        </div>
      </section>
    </main>
  );
}
