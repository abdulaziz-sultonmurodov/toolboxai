'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your creative workspace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-pink-500">Audio Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">2 tools available</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500/20 to-violet-600/20 border-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-violet-500">Video Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">1 tool available</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-none">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-cyan-500">Image Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">2 tools available</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
