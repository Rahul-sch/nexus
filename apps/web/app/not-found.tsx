import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Home, History } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[var(--background-secondary)] flex items-center justify-center">
            <FileQuestion className="h-6 w-6 text-[var(--foreground-secondary)]" />
          </div>
          <CardTitle>Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-[var(--foreground-secondary)] mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="secondary">
                <History className="h-4 w-4 mr-2" />
                View History
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
