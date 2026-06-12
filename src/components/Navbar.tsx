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
    { name: "Catalogue", path: "/", icon: Library, public: true },
    { name: "Search", path: "/search", icon: Search, public: true },
    { name: "My Loans", path: "/my-books", icon: BookOpen, public: false },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary/80 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex h-[4.25rem] items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center border border-primary-foreground/20 bg-primary-foreground/10">
            <Library className="h-5 w-5 text-accent" strokeWidth={1.5} />
          </div>
          <div className="leading-tight">
            <span className="font-display text-lg font-bold tracking-tight">Xteem Library</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-primary-foreground/70">
              Digital Collections
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            if (!item.public && !user) return null;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 rounded-sm px-4 ${
                    isActive
                      ? "bg-primary-foreground/15 text-primary-foreground font-medium"
                      : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.5} />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 gap-2 rounded-sm border border-primary-foreground/20 bg-primary-foreground/5 pl-2 pr-3 hover:bg-primary-foreground/10"
                >
                  <Avatar className="h-7 w-7 rounded-sm">
                    <AvatarImage src="" alt={user?.email || "User"} />
                    <AvatarFallback className="rounded-sm bg-accent text-[10px] font-bold text-accent-foreground">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline-block">
                    {user?.email?.split("@")[0] || "Account"}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-primary-foreground/70 sm:block" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 mt-1 rounded-sm">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email?.split("@")[0] || "Library member"}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="md:hidden">
                  <DropdownMenuItem onSelect={() => navigate("/my-books")} className="cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>My Loans</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>

                <DropdownMenuItem onSelect={() => navigate("/search")} className="cursor-pointer">
                  <Search className="mr-2 h-4 w-4" />
                  <span>Search catalogue</span>
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
                      <span>Administration</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button
                size="sm"
                variant="secondary"
                className="gap-2 rounded-sm border border-primary-foreground/20 bg-primary-foreground px-5 text-primary hover:bg-primary-foreground/90"
              >
                <User className="h-4 w-4" />
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
