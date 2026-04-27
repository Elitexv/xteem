import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAllBooks } from "@/lib/supabaseApi";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import BorrowDialog from "@/components/BorrowDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search as SearchIcon, Library, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchActiveBorrowingBookIds } from "@/lib/supabaseApi";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [localQ, setLocalQ] = useState(initialQ);

  useEffect(() => {
    setLocalQ(searchParams.get("q") ?? "");
  }, [searchParams]);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [borrowBookId, setBorrowBookId] = useState<string | null>(null);

  const { data: books, isLoading: booksLoading, isError, error, refetch } = useQuery({
    queryKey: ["books"],
    queryFn: () => fetchAllBooks(),
    retry: 2,
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 4000),
    refetchOnReconnect: true,
  });

  const { data: activeBorrowings } = useQuery({
    queryKey: ["active-borrowings", user?.id],
    queryFn: () => fetchActiveBorrowingBookIds(user!.id),
    enabled: !!user,
    retry: 2,
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 4000),
    refetchOnReconnect: true,
  });

  const activeBorrowedBookIds = new Set((activeBorrowings ?? []).map((item) => item.book_id));

  const borrowMutation = useMutation({
    mutationFn: async ({ bookId, days }: { bookId: string; days: number }) => {
      if (activeBorrowedBookIds.has(bookId)) {
        throw new Error("You already have this book borrowed. Return it before borrowing again.");
      }
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
        if (book.available_copies <= 0) throw new Error("No copies are currently available for this book.");
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
    onError: (e: Error) => {
      toast({ title: "Failed to borrow", description: e.message, variant: "destructive" });
      setBorrowBookId(null);
    },
  });

  const borrowBook = books?.find((b) => b.id === borrowBookId);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  const filtered = useMemo(() => {
    const list = books ?? [];
    if (!q) return list;
    return list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.description ?? "").toLowerCase().includes(q)
    );
  }, [books, q]);

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = localQ.trim();
    setSearchParams(next ? { q: next } : {});
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Library className="h-8 w-8" />
          <h1 className="font-display text-2xl font-bold">Search catalog</h1>
        </div>
        <form onSubmit={runSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Title, author, or description…"
              value={localQ}
              onChange={(e) => setLocalQ(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/">Browse all</Link>
          </Button>
        </form>

        {booksLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/5] bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="mb-2">Failed to load books.</p>
            <p className="text-sm mb-4">{error instanceof Error ? error.message : "Try again."}</p>
            <Button onClick={() => void refetch()}>Retry now</Button>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isLoggedIn={!!user}
                isBorrowed={activeBorrowedBookIds.has(book.id)}
                onBorrow={(id) => setBorrowBookId(id)}
                borrowing={borrowBookId === book.id && borrowMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No books match “{q || "your search"}”.</p>
            <Button variant="link" asChild className="mt-2">
              <Link to="/">Back to Discover</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
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

export default Search;
