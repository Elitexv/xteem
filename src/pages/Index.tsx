import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchActiveBorrowingBookIds, fetchAllBooks } from "@/lib/supabaseApi";
import { formatBookCategory, listCatalogCategories } from "@/lib/bookCategories";
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

  const categories = useMemo(
    () => listCatalogCategories((books ?? []).map((book) => book.category)),
    [books]
  );

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
      selectedCategories.includes(formatBookCategory(b.category));
    return matchesSearch && matchesCategory;
  });

  const totalTitles = books?.length ?? 0;
  const availableCopies = books?.reduce((sum, book) => sum + (book.available_copies ?? 0), 0) ?? 0;
  const inStockTitles = books?.filter((book) => (book.available_copies ?? 0) > 0).length ?? 0;

  return (
    <div className="library-shell">
      <Navbar />

      <section className="library-hero">
        <div className="library-hero-inner">
          <div className="mx-auto max-w-3xl space-y-5">
            <p className="library-eyebrow">Educational Resource Centre</p>
            <Library className="h-9 w-9 sm:h-11 sm:w-11 mx-auto text-primary" strokeWidth={1.5} />
            <h1 className="font-display text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-foreground leading-tight">
              Academic Library Catalogue
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Browse textbooks and reference materials across disciplines. Borrow digital copies and read in your browser.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Badge variant="outline" className="rounded-sm px-3 py-1 font-normal border-primary/20 bg-background">
                {totalTitles} volumes
              </Badge>
              <Badge variant="outline" className="rounded-sm px-3 py-1 font-normal border-primary/20 bg-background">
                {availableCopies} copies on shelf
              </Badge>
              <Badge variant="outline" className="rounded-sm px-3 py-1 font-normal border-primary/20 bg-background">
                {inStockTitles} available to borrow
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or author…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 classic-input h-11"
                />
              </div>
              <Button variant="outline" className="h-11 shrink-0" asChild>
                <Link to="/search" className="gap-2 inline-flex items-center">
                  <Search className="h-4 w-4" />
                  Full catalogue search
                </Link>
              </Button>
            </div>

            {categories.length > 0 && (
              <div className="pt-4 border-t border-border/80 mt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Browse by field of study
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category);
                    return (
                      <Button
                        key={category}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCategory(category)}
                        className="category-chip"
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
                      className="category-chip text-muted-foreground"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-16 px-4 pt-8">
        <div className="container mx-auto">
          <div className="mb-6 flex items-end justify-between border-b border-border pb-3">
            <h2 className="font-display text-xl font-bold text-foreground">Catalogue</h2>
            <p className="text-sm text-muted-foreground hidden sm:block">
              {filtered?.length ?? 0} result{(filtered?.length ?? 0) === 1 ? "" : "s"}
            </p>
          </div>
          {booksLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[8.5rem] animate-pulse rounded-sm bg-muted sm:aspect-[3/5] sm:h-auto" />
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
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
