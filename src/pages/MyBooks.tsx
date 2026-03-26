import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, RotateCcw, Eye } from "lucide-react";
import { format } from "date-fns";
import PdfViewer from "@/components/PdfViewer";

const MyBooks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [readingBook, setReadingBook] = useState<{ title: string; pdfUrl: string } | null>(null);

  const { data: borrowings, isLoading } = useQuery({
    queryKey: ["my-borrowings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("borrowings")
        .select("*, books(*)")
        .eq("user_id", user!.id)
        .order("borrowed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const returnMutation = useMutation({
    mutationFn: async ({ borrowingId, bookId }: { borrowingId: string; bookId: string }) => {
      const { error: returnError } = await supabase
        .from("borrowings")
        .update({ status: "returned", returned_at: new Date().toISOString() })
        .eq("id", borrowingId);
      if (returnError) throw returnError;

      const book = borrowings?.find((b) => b.book_id === bookId)?.books;
      if (book) {
        const { error: updateError } = await supabase
          .from("books")
          .update({ available_copies: (book as any).available_copies + 1 })
          .eq("id", bookId);
        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      toast({ title: "Book returned!" });
      queryClient.invalidateQueries({ queryKey: ["my-borrowings"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to return", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-6">My Borrowed Books</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : borrowings && borrowings.length > 0 ? (
          <div className="space-y-3">
            {borrowings.map((b) => {
              const book = b.books as any;
              return (
                <Card key={b.id} className="animate-fade-in">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-16 w-12 bg-secondary rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {book?.cover_url ? (
                        <img src={book.cover_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold truncate">{book?.title}</p>
                      <p className="text-sm text-muted-foreground">{book?.author}</p>
                      <p className="text-xs text-muted-foreground">
                        Borrowed {format(new Date(b.borrowed_at), "MMM d, yyyy")} · Due {format(new Date(b.due_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={b.status === "borrowed" ? "default" : "secondary"}>
                        {b.status}
                      </Badge>
                      {b.status === "borrowed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => returnMutation.mutate({ borrowingId: b.id, bookId: b.book_id })}
                          disabled={returnMutation.isPending}
                          className="gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Return
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>You haven't borrowed any books yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooks;
