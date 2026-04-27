import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchProfileForUser } from "@/lib/supabaseApi";
import { User } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading, isError, error, refetch } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfileForUser(user!.id),
    enabled: Boolean(user?.id),
    retry: 2,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-lg">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              <CardTitle className="font-display">Profile</CardTitle>
            </div>
            <CardDescription>Your library account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileLoading ? (
              <div className="h-24 rounded-md bg-muted animate-pulse" />
            ) : isError ? (
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">{error instanceof Error ? error.message : "Could not load profile."}</p>
                <Button size="sm" variant="outline" onClick={() => void refetch()}>
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Email</p>
                  <p className="text-sm">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Display name</p>
                  <p className="text-sm">{profile?.full_name || "—"}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
