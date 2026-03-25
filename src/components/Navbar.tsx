import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, Shield, User, Library } from "lucide-react";

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Library className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold text-foreground">eLibrary</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/my-books">
                <Button variant="ghost" size="sm" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">My Books</span>
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
