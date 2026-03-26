import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye } from "lucide-react";

type BookCardProps = {
  book: Tables<"books">;
  onBorrow?: (bookId: string) => void;
  onRead?: (bookId: string) => void;
  borrowing?: boolean;
  isLoggedIn?: boolean;
};

const BookCard = ({ book, onBorrow, onRead, borrowing, isLoggedIn }: BookCardProps) => {
  const available = book.available_copies > 0;

  return (
    <Card className="book-card-hover overflow-hidden flex flex-col">
      <div className="aspect-[3/4] bg-secondary flex items-center justify-center overflow-hidden">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="h-16 w-16 text-muted-foreground/40" />
        )}
      </div>
      <CardContent className="flex-1 p-4 space-y-2">
        <h3 className="font-display font-semibold text-base leading-tight line-clamp-2">{book.title}</h3>
        <p className="text-sm text-muted-foreground">{book.author}</p>
        {book.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{book.description}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <Badge variant={available ? "default" : "secondary"} className="text-xs">
            {available ? `${book.available_copies} available` : "Unavailable"}
          </Badge>
          {isLoggedIn && available && onBorrow && (
            <Button size="sm" onClick={() => onBorrow(book.id)} disabled={borrowing}>
              {borrowing ? "..." : "Borrow"}
            </Button>
          )}
        </div>
        {isLoggedIn && (book as any).pdf_url && onRead && (
          <Button size="sm" variant="outline" className="w-full gap-1" onClick={() => onRead(book.id)}>
            <Eye className="h-3 w-3" />
            Read Online
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookCard;
