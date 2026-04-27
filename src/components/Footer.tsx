import { Library, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Library className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                eLibrary
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your digital library — borrow, read, and discover books anytime, anywhere.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Browse Catalog
              </Link>
              <Link to="/my-books" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                My Books
              </Link>
              <Link to="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Search
              </Link>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">About</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Access thousands of books in PDF format. Borrow for up to 30 days and read directly in your browser.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} eLibrary. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> by Xteem
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
