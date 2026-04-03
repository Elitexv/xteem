import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BookCard from "@/components/BookCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BorrowDialog from "@/components/BorrowDialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Library, BookOpen } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [borrowBookId, setBorrowBookId] = useState<string | null>(null);

  const { data: books, isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const borrowMutation = useMutation({
    mutationFn: async ({ bookId, days }: { bookId: string; days: number }) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + days);

      const { error: borrowError } = await supabase.from("borrowings").insert({
        user_id: user!.id,
        book_id: bookId,
        due_date: dueDate.toISOString(),
      });
      if (borrowError) throw borrowError;

      const book = books?.find((b) => b.id === bookId);
      if (book) {
        const { error: updateError } = await supabase
          .from("books")
          .update({ available_copies: book.available_copies - 1 })
          .eq("id", bookId);
        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      toast({ title: "Book borrowed!", description: "Check My Books to read and track your borrowing." });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setBorrowBookId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to borrow", description: error.message, variant: "destructive" });
      setBorrowBookId(null);
    },
  });

  const borrowBook = books?.find((b) => b.id === borrowBookId);

  const filtered = books?.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-10 sm:py-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl space-y-3 sm:space-y-4">
          <Library className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-primary opacity-80" />
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Discover Your Next Read
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Browse our collection, borrow books, and read online.
          </p>
          <div className="relative max-w-md mx-auto mt-4 sm:mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-16 px-4">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/5] bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map((book, i) => (
                <div key={book.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <BookCard
                    book={book}
                    isLoggedIn={!!user}
                    onBorrow={(id) => setBorrowBookId(id)}
                    borrowing={borrowBookId === book.id && borrowMutation.isPending}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No books found.</p>
              <p className="text-sm">Check back later or adjust your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Borrow dialog with days selection */}
      {borrowBook && (
        <BorrowDialog
          bookTitle={borrowBook.title}
          open={!!borrowBookId}
          onOpenChange={(open) => !open && setBorrowBookId(null)}
          onConfirm={(days) => borrowMutation.mutate({ bookId: borrowBook.id, days })}
          loading={borrowMutation.isPending}
        />
      )}

    </div>
  );
};

export default Index;
