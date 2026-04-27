import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchActiveBorrowingBookIds, fetchAllBooks } from "@/lib/supabaseApi";
import { useAuth } from "@/contexts/AuthContext";
import BookCard from "@/components/BookCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BorrowDialog from "@/components/BorrowDialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Library, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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
        if (book.available_copies <= 0) {
          throw new Error("No copies are currently available for this book.");
        }
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

  const categories = Array.from(
    new Set((books ?? []).map((book) => book.category || "General"))
  ).sort((a, b) => a.localeCompare(b));

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const filtered = books?.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(b.category || "General");
    return matchesSearch && matchesCategory;
  });

  const totalTitles = books?.length ?? 0;
  const availableCopies = books?.reduce((sum, book) => sum + (book.available_copies ?? 0), 0) ?? 0;
  const inStockTitles = books?.filter((book) => (book.available_copies ?? 0) > 0).length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="px-4 pt-8 pb-6 sm:pt-12 sm:pb-10">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 sm:p-10 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_45%)] pointer-events-none" />
            <div className="relative mx-auto max-w-2xl space-y-4">
              <Library className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-primary opacity-90" />
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                Discover Your Next Read
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                Browse our collection, borrow books, and read online.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button variant="outline" size="sm" className="rounded-full" asChild>
                  <Link to="/search" className="gap-1 inline-flex items-center">
                    <Search className="h-3.5 w-3.5" />
                    Advanced search
                  </Link>
                </Button>
                <Badge variant="secondary" className="px-3 py-1">
                  {totalTitles} titles
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  {availableCopies} copies available
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  {inStockTitles} ready to borrow
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-4 sm:mt-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or author..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-background/90"
                  />
                </div>
              </div>

              {categories.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category);
                    return (
                      <Button
                        key={category}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCategory(category)}
                        className="h-8 rounded-full px-3"
                      >
                        {category}
                      </Button>
                    );
                  })}
                  {selectedCategories.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategories([])}
                      className="h-8 rounded-full px-3"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-16 px-4">
        <div className="container mx-auto">
          {booksLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/5] bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-muted-foreground">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Failed to load books.</p>
              <p className="text-sm mb-4">{error instanceof Error ? error.message : "Please try again."}</p>
              <Button onClick={() => void refetch()}>Retry now</Button>
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {filtered.map((book, i) => (
                <div key={book.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <BookCard
                    book={book}
                    isLoggedIn={!!user}
                    isBorrowed={activeBorrowedBookIds.has(book.id)}
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

      <Footer />

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
