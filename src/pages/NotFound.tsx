import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="library-shell flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="classic-card max-w-md border-dashed p-10 text-center">
          <p className="library-eyebrow mb-3">Error 404</p>
          <h1 className="font-display mb-3 text-4xl font-bold">Page not found</h1>
          <p className="mb-6 text-muted-foreground">
            The page <span className="font-mono text-sm">{location.pathname}</span> is not in the catalogue.
          </p>
          <Link to="/" className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80">
            Return to catalogue
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
