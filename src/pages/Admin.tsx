import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, BookOpen, Trash2, Users } from "lucide-react";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";

const Admin = () => {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [isbn, setIsbn] = useState("");
  const [copies, setCopies] = useState("1");
  const [showForm, setShowForm] = useState(false);

  const { data: books } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: borrowings } = useQuery({
    queryKey: ["all-borrowings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("borrowings")
        .select("*, books(*)")
        .order("borrowed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addBookMutation = useMutation({
    mutationFn: async () => {
      const totalCopies = parseInt(copies) || 1;
      const { error } = await supabase.from("books").insert({
        title,
        author,
        description: description || null,
        isbn: isbn || null,
        total_copies: totalCopies,
        available_copies: totalCopies,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Book added!" });
      setTitle(""); setAuthor(""); setDescription(""); setIsbn(""); setCopies("1");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const { error } = await supabase.from("books").delete().eq("id", bookId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Book deleted" });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Book
          </Button>
        </div>

        {showForm && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="font-display">Add New Book</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => { e.preventDefault(); addBookMutation.mutate(); }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Author *</Label>
                  <Input value={author} onChange={(e) => setAuthor(e.target.value)} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>ISBN</Label>
                  <Input value={isbn} onChange={(e) => setIsbn(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Copies</Label>
                  <Input type="number" min="1" value={copies} onChange={(e) => setCopies(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={addBookMutation.isPending}>
                    {addBookMutation.isPending ? "Adding..." : "Add Book"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Books list */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Books ({books?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {books?.map((book) => (
                <div key={book.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{book.title}</p>
                    <p className="text-sm text-muted-foreground">{book.author} · {book.available_copies}/{book.total_copies} available</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBookMutation.mutate(book.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(!books || books.length === 0) && (
                <p className="text-muted-foreground text-center py-4">No books yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Borrowings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Users className="h-5 w-5" /> All Borrowings ({borrowings?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {borrowings?.map((b) => {
                const book = b.books as any;
                return (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{book?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Borrowed {format(new Date(b.borrowed_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant={b.status === "borrowed" ? "default" : "secondary"}>{b.status}</Badge>
                  </div>
                );
              })}
              {(!borrowings || borrowings.length === 0) && (
                <p className="text-muted-foreground text-center py-4">No borrowings yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
