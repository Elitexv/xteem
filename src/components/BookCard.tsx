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
  const totalCopies = book.total_copies ?? book.available_copies ?? 0;
  const canBorrow = isLoggedIn && available && !isBorrowed;

  return (
    <Card className="book-card-classic group flex h-full flex-row overflow-hidden sm:flex-col">
      {/* Cover — thumbnail strip on mobile, full poster on sm+ */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border-border bg-muted/40",
          "w-[5.5rem] min-h-[8.25rem] border-r sm:w-full sm:min-h-0 sm:border-b sm:border-r-0 sm:aspect-[3/4]"
        )}
      >
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-secondary/50 p-2 text-center sm:gap-2 sm:p-4">
            <BookOpen className="h-6 w-6 text-muted-foreground/35 sm:h-10 sm:w-10" strokeWidth={1.25} />
            <span className="hidden text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 sm:inline">
              No cover
            </span>
          </div>
        )}

        <div className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2">
          <Badge
            variant={available ? "default" : "secondary"}
            className={cn(
              "rounded-sm px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wide sm:px-2 sm:text-[10px]",
              !available && "bg-muted text-muted-foreground"
            )}
          >
            {available ? "In" : "Out"}
          </Badge>
        </div>

        {/* Desktop / tablet: borrow on hover */}
        {canBorrow && (
          <div className="absolute inset-x-0 bottom-0 hidden border-t border-border/60 bg-card/95 p-2 opacity-0 transition-opacity group-hover:opacity-100 sm:block">
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

      <div className="flex min-w-0 flex-1 flex-col">
        <CardContent className="flex flex-1 flex-col gap-1.5 p-3 sm:space-y-2 sm:p-4">
          <Badge
            variant="outline"
            className="w-fit max-w-full truncate rounded-sm border-accent/30 bg-accent/5 text-[9px] font-medium text-accent sm:text-[10px]"
            title={categoryLabel}
          >
            {categoryLabel}
          </Badge>

          <div className="min-w-0 space-y-0.5">
            <h3
              className="line-clamp-2 font-display text-sm font-bold leading-snug text-foreground sm:text-[15px]"
              title={book.title}
            >
              {book.title}
            </h3>
            <p className="truncate text-xs text-muted-foreground" title={book.author}>
              {book.author}
            </p>
          </div>

          {book.description && (
            <p className="hidden line-clamp-2 text-[11px] leading-relaxed text-muted-foreground sm:block">
              {book.description}
            </p>
          )}

          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:hidden">
            {book.available_copies}/{totalCopies} copies
          </p>
        </CardContent>

        <CardFooter className="mt-auto flex flex-col gap-2 border-t border-border/70 bg-muted/20 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
          {/* Mobile: always show borrow — hover does not work on touch */}
          {canBorrow && (
            <Button
              size="sm"
              className="h-9 w-full text-xs sm:hidden"
              onClick={() => onBorrow?.(book.id)}
              disabled={borrowing}
            >
              {borrowing ? "Processing…" : "Borrow"}
            </Button>
          )}

          <span className="hidden text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:inline">
            {book.available_copies} of {totalCopies} copies
          </span>

          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
            {!canBorrow && isLoggedIn && !available && !isBorrowed && (
              <span className="text-[10px] text-muted-foreground sm:hidden">Unavailable</span>
            )}

            <div className="ml-auto flex items-center gap-1">
              {showReadButton && book.pdf_url && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-sm"
                  onClick={() => onRead?.(book.id)}
                  title="Read online"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {isBorrowed && (
                <Badge variant="outline" className="rounded-sm border-primary/30 text-[10px] text-primary sm:text-xs">
                  <Check className="mr-1 h-3 w-3" />
                  Borrowed
                </Badge>
              )}
            </div>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};

export default BookCard;
