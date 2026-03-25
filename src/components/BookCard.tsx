import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

type BookCardProps = {
  book: Tables<"books">;
  onBorrow?: (bookId: string) => void;
  borrowing?: boolean;
  isLoggedIn?: boolean;
};

const BookCard = ({ book, onBorrow, borrowing, isLoggedIn }: BookCardProps) => {
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
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <Badge variant={available ? "default" : "secondary"} className="text-xs">
          {available ? `${book.available_copies} available` : "Unavailable"}
        </Badge>
        {isLoggedIn && available && onBorrow && (
          <Button size="sm" onClick={() => onBorrow(book.id)} disabled={borrowing}>
            {borrowing ? "Borrowing..." : "Borrow"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookCard;
