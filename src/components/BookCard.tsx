import { Tables } from "@/integrations/supabase/types";
import { formatBookCategory } from "@/lib/bookCategories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type BookCardProps = {
  book: Tables<"books">;
  onBorrow?: (bookId: string) => void;
  onRead?: (bookId: string) => void;
  borrowing?: boolean;
  isLoggedIn?: boolean;
  isBorrowed?: boolean;
  showReadButton?: boolean;
};

const BookCard = ({ book, onBorrow, onRead, borrowing, isLoggedIn, isBorrowed, showReadButton }: BookCardProps) => {
  const available = (book.available_copies ?? 0) > 0;
  const categoryLabel = formatBookCategory(book.category);

  return (
    <Card className="book-card-classic group overflow-hidden">
      <div className="relative aspect-[3/4] overflow-hidden border-b border-border bg-muted/40">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-secondary/50 p-4 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/35" strokeWidth={1.25} />
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
              No cover
            </span>
          </div>
        )}

        <div className="absolute left-2 top-2">
          <Badge
            variant={available ? "default" : "secondary"}
            className={cn(
              "rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              !available && "bg-muted text-muted-foreground"
            )}
          >
            {available ? "Available" : "On loan"}
          </Badge>
        </div>

        {isLoggedIn && available && !isBorrowed && (
          <div className="absolute inset-x-0 bottom-0 border-t border-border/60 bg-card/95 p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="sm"
              className="h-8 w-full text-xs"
              onClick={() => onBorrow?.(book.id)}
              disabled={borrowing}
            >
              {borrowing ? "Processing…" : "Borrow"}
            </Button>
          </div>
        )}
      </div>

      <CardContent className="space-y-2 p-4">
        <Badge variant="outline" className="rounded-sm border-accent/30 bg-accent/5 text-[10px] font-medium text-accent">
          {categoryLabel}
        </Badge>
        <div className="space-y-0.5">
          <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-foreground">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground">{book.author}</p>
        </div>
        {book.description && (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {book.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-3">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {book.available_copies} of {book.total_copies ?? book.available_copies} copies
        </span>
        <div className="flex items-center gap-1">
          {showReadButton && book.pdf_url && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-sm"
              onClick={() => onRead?.(book.id)}
              title="Read online"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {isBorrowed && (
            <Badge variant="outline" className="rounded-sm border-primary/30 text-primary">
              <Check className="mr-1 h-3 w-3" />
              Borrowed
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookCard;
