import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

const Notifications = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-lg">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              <CardTitle className="font-display">Notifications</CardTitle>
            </div>
            <CardDescription>Loan reminders and library updates will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">You have no notifications yet.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
