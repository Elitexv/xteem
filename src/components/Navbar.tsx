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
import { BookOpen, LogOut, Shield, User, Library, ChevronDown, Search, Bell, CircleUser } from "lucide-react";

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const navItems = [
    { name: "Discover", path: "/", icon: Library, public: true },
    { name: "Search", path: "/search", icon: Search, public: true },
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

        {/* Center Navigation */}
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
                <Button variant="ghost" className="pl-2 pr-3 gap-2 sm:gap-3 h-10 rounded-full border border-border/50 hover:bg-accent">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="" alt={user?.email || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block text-sm font-medium max-w-[120px] truncate">
                    {user?.email?.split("@")[0] || "Account"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 mt-1">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email?.split("@")[0] || "Library Member"}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Mobile-only nav items */}
                <div className="md:hidden">
                  <DropdownMenuItem onSelect={() => navigate("/my-books")} className="cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>My Books</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>

                <DropdownMenuItem onSelect={() => navigate("/search")} className="cursor-pointer">
                  <Search className="mr-2 h-4 w-4" />
                  <span>Search catalog</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/profile")} className="cursor-pointer">
                  <CircleUser className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/notifications")} className="cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {isAdmin && (
                  <>
                    <DropdownMenuItem onSelect={() => navigate("/admin")} className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
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
