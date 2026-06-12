import { Library } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-auto border-t-2 border-primary/20 bg-card">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center border border-primary/20 bg-primary/5">
                <Library className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <span className="font-display text-lg font-bold text-foreground">Xteem Library</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A digital academic library for students and educators — borrow course materials and reference texts online.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">Navigation</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Catalogue
              </Link>
              <Link to="/search" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Search
              </Link>
              <Link to="/my-books" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                My Loans
              </Link>
              <Link to="/auth" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Sign in
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">Collections</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Resources are organised by field of study — from science and engineering to humanities, law, medicine, and more.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Xteem Library. All rights reserved.</p>
          <p className="text-accent font-medium">Educational use · Digital lending</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
