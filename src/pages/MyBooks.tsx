import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, RotateCcw, Eye, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import PdfViewer from "@/components/PdfViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      toast({ title: "Book returned successfully!" });
      queryClient.invalidateQueries({ queryKey: ["my-borrowings"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });

  // UX Logic: Separate active reads from history
  const activeBorrowings = borrowings?.filter(b => b.status === 'borrowed') || [];
  const returnedHistory = borrowings?.filter(b => b.status === 'returned') || [];

  if (!isLoading && activeBorrowings.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Navbar />
        <main className="container mx-auto px-4 py-10 max-w-5xl">
          <div className="rounded-2xl border-2 border-dashed bg-background py-24 px-6 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <h1 className="text-2xl font-semibold tracking-tight">No book borrowed</h1>
            <p className="mt-2 text-muted-foreground">You have no active borrowed books right now.</p>
            <Button className="mt-6" onClick={() => (window.location.href = "/")}>
              Browse Catalog
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Personal Library</h1>
          <p className="text-muted-foreground">Manage your active loans and reading history.</p>
        </header>

        <Tabs defaultValue="current" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-background border">
              <TabsTrigger value="current" className="gap-2">
                Active <Badge variant="secondary" className="h-5 px-1.5">{activeBorrowings.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="current" className="animate-in fade-in slide-in-from-left-4 duration-300">
            {activeBorrowings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBorrowings.map((b) => {
                  const book = b.books as any;
                  const daysLeft = differenceInDays(new Date(b.due_date), new Date());
                  const progressValue = Math.max(0, Math.min(100, (daysLeft / 14) * 100)); // Assuming 14-day loan

                  return (
                    <Card key={b.id} className="overflow-hidden flex flex-col group hover:shadow-md transition-all border-border/50">
                      <div className="aspect-[3/2] relative bg-muted overflow-hidden">
                        {book?.cover_url ? (
                          <img src={book.cover_url} alt="" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="flex items-center justify-center h-full"><BookOpen className="h-12 w-12 text-muted-foreground/20" /></div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className={daysLeft < 3 ? "bg-destructive" : "bg-primary/90"}>
                            {daysLeft <= 0 ? "Due Today" : `${daysLeft} days left`}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-5 flex-1">
                        <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-1">{book?.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{book?.author}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Loan Period</span>
                            <span>{Math.round(progressValue)}% time left</span>
                          </div>
                          <Progress value={progressValue} className="h-1.5" />
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 bg-muted/50 border-t flex gap-2">
                        {book?.pdf_url && (
                          <Button 
                            className="flex-1 gap-2 shadow-sm" 
                            onClick={() => setReadingBook({ title: book?.title, pdfUrl: book.pdf_url })}
                          >
                            <Eye className="h-4 w-4" /> Read Now
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => returnMutation.mutate({ borrowingId: b.id, bookId: b.book_id })}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <EmptyShelf message="You don't have any books checked out." />
            )}
          </TabsContent>

          <TabsContent value="history" className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Desktop table */}
            <div className="hidden sm:block rounded-xl border bg-background overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Book</th>
                    <th className="text-left p-4 font-medium">Borrowed</th>
                    <th className="text-left p-4 font-medium">Returned</th>
                    <th className="text-right p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {returnedHistory.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium">{(b.books as any).title}</div>
                        <div className="text-xs text-muted-foreground">{(b.books as any).author}</div>
                      </td>
                      <td className="p-4 text-muted-foreground">{format(new Date(b.borrowed_at), "MMM d, yyyy")}</td>
                      <td className="p-4 text-muted-foreground">{b.returned_at ? format(new Date(b.returned_at), "MMM d, yyyy") : "-"}</td>
                      <td className="p-4 text-right">
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Returned
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {returnedHistory.length === 0 && <div className="p-8 text-center text-muted-foreground">No return history found.</div>}
            </div>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {returnedHistory.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground rounded-xl border bg-background">No return history found.</div>
              ) : (
                returnedHistory.map((b) => (
                  <Card key={b.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{(b.books as any).title}</p>
                        <p className="text-xs text-muted-foreground">{(b.books as any).author}</p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 shrink-0 text-[10px]">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Returned
                      </Badge>
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                      <span>Borrowed: {format(new Date(b.borrowed_at), "MMM d")}</span>
                      <span>Returned: {b.returned_at ? format(new Date(b.returned_at), "MMM d") : "-"}</span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {readingBook && (
        <PdfViewer
          pdfUrl={readingBook.pdfUrl}
          title={readingBook.title}
          open={!!readingBook}
          onOpenChange={(open) => !open && setReadingBook(null)}
        />
      )}
    </div>
  );
};

const EmptyShelf = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-2xl border-2 border-dashed bg-background">
    <div className="bg-muted p-4 rounded-full mb-4">
      <BookOpen className="h-10 w-10 text-muted-foreground/40" />
    </div>
    <h3 className="text-lg font-semibold">Your shelf is empty</h3>
    <p className="text-muted-foreground max-w-xs mx-auto mb-6">{message}</p>
    <Button variant="outline" onClick={() => window.location.href = '/'}>Browse Catalog</Button>
  </div>
);

export default MyBooks;