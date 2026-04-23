import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils"; // shadcn utility for conditional classes

type BookCardProps = {
  book: Tables<"books">;
  onBorrow?: (bookId: string) => void;
  onRead?: (bookId: string) => void;
  borrowing?: boolean;
  isLoggedIn?: boolean;
  isBorrowed?: boolean;
  showReadButton?: boolean; // Only true when user has actively borrowed this book
};

const BookCard = ({ book, onBorrow, onRead, borrowing, isLoggedIn, isBorrowed, showReadButton }: BookCardProps) => {
  const available = (book.available_copies ?? 0) > 0;

  return (
    <Card className="group relative overflow-hidden border-none bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image Container with Overlay */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {book.cover_url ? (
          <img 
            src={book.cover_url} 
            alt={book.title} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary/30">
            <BookOpen className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}

        {/* Status Badge Overlay */}
        <div className="absolute left-2 top-2">
          <Badge 
            variant={available ? "default" : "secondary"} 
            className={cn(
              "backdrop-blur-md border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm",
              available ? "bg-primary/90" : "bg-black/60 text-white"
            )}
          >
            {available ? "In Stock" : "Out of Stock"}
          </Badge>
        </div>

        {/* Hover Action Overlay (Modern UX) */}
        {isLoggedIn && available && !isBorrowed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button 
              size="sm" 
              onClick={() => onBorrow?.(book.id)} 
              disabled={borrowing}
              className="translate-y-4 transition-transform duration-300 group-hover:translate-y-0"
            >
              {borrowing ? "Processing..." : "Quick Borrow"}
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-1">
          <h3 className="line-clamp-1 font-display text-base font-bold tracking-tight text-foreground">
            {book.title}
          </h3>
          <p className="text-xs font-medium text-muted-foreground">
            {book.author}
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/80">
            {book.category || "General"}
          </p>
        </div>
        
        {book.description && (
          <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground/80">
            {book.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 p-4 pt-0">
        <div className="flex w-full items-center justify-between border-t border-border/50 pt-3">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">
            {book.available_copies} Copies left
          </span>
          
          <div className="flex gap-1">
            {showReadButton && book.pdf_url && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                onClick={() => onRead?.(book.id)}
                title="Read Online"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            
            {isBorrowed && (
              <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-600">
                <Check className="mr-1 h-3 w-3" /> Borrowed
              </Badge>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookCard;