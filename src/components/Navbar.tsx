import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, LogOut, Shield, User, Library, LayoutDashboard, ChevronDown } from "lucide-react";

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Define core nav items for scalability
  const navItems = [
    { name: "Discover", path: "/", icon: Library, public: true },
    { name: "My Books", path: "/my-books", icon: BookOpen, public: false },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Library className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            eLibrary
          </span>
        </Link>

        {/* Center Navigation - Advanced Display with Active States */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            if (!item.public && !user) return null;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`gap-2 transition-all duration-200 ${
                    isActive ? "bg-secondary text-secondary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Right Side - User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="pl-2 pr-3 gap-3 h-10 rounded-full border border-border/50 hover:bg-accent">
                  <Avatar className="h-7 w-7">
                    {/* Fallback to user's initial or an icon if no image exists */}
                    <AvatarImage src={""} alt={user?.email || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user?.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block text-sm font-medium">
                    {user?.email?.split("@")[0] || "Account"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 mt-1">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email?.split("@")[0] || "Library Member"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Mobile-only nav items inside dropdown to save space */}
                <div className="md:hidden">
                  <DropdownMenuItem asChild>
                    <Link to="/my-books" className="cursor-pointer flex w-full items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>My Books</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>

                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer flex w-full items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {isAdmin && <DropdownMenuSeparator />}
                
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="gap-2 rounded-full px-6 shadow-sm transition-all hover:shadow-md">
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