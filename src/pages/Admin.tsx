import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, BookOpen, Trash2, Users, Upload, Search, Library, ArrowLeftRight, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";

// New shadcn/ui imports needed for the modern layout
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Admin = () => {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [isbn, setIsbn] = useState("");
  const [copies, setCopies] = useState("1");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false); // Controls Dialog
  const [borrowSearch, setBorrowSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: borrowings, isLoading: borrowingsLoading } = useQuery({
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
      let pdfUrl: string | null = null;
      let coverUrl: string | null = null;

      if (pdfFile) {
        const fileName = `${Date.now()}-${pdfFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("book-pdfs")
          .upload(fileName, pdfFile, { contentType: "application/pdf" });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("book-pdfs").getPublicUrl(fileName);
        pdfUrl = urlData.publicUrl;
      }

      if (coverFile) {
        const fileName = `${Date.now()}-${coverFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("book-covers")
          .upload(fileName, coverFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("book-covers").getPublicUrl(fileName);
        coverUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("books").insert({
        title, author, description: description || null, isbn: isbn || null,
        total_copies: totalCopies, available_copies: totalCopies, pdf_url: pdfUrl, cover_url: coverUrl,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Book added successfully!" });
      setTitle(""); setAuthor(""); setDescription(""); setIsbn(""); setCopies("1");
      setPdfFile(null); setCoverFile(null);
      setIsAddBookOpen(false); // Close dialog on success
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add book", description: error.message, variant: "destructive" });
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

  // Calculate stats for the dashboard overview
  const totalBooks = books?.length || 0;
  const activeBorrowings = borrowings?.filter((b) => b.status === "borrowed").length || 0;
  const totalAvailable = books?.reduce((acc, book) => acc + (book.available_copies || 0), 0) || 0;

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Admin Workspace</h1>
            <p className="text-muted-foreground mt-1">Manage your library catalog and user borrowings.</p>
          </div>
          
          <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-sm">
                <Plus className="h-4 w-4" />
                Add New Book
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
                <DialogDescription>Fill in the details below to add a new book to the catalog.</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addBookMutation.mutate(); }} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Form fields identical to your original code */}
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. The Great Gatsby" />
                </div>
                <div className="space-y-2">
                  <Label>Author *</Label>
                  <Input value={author} onChange={(e) => setAuthor(e.target.value)} required placeholder="e.g. F. Scott Fitzgerald" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Brief summary..." />
                </div>
                <div className="space-y-2">
                  <Label>ISBN</Label>
                  <Input value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Total Copies</Label>
                  <Input type="number" min="1" value={copies} onChange={(e) => setCopies(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Book PDF *</Label>
                  <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} required className="cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="cursor-pointer" />
                </div>
                <div className="md:col-span-2 pt-4">
                  <Button type="submit" disabled={addBookMutation.isPending} className="w-full gap-2">
                    <Upload className="h-4 w-4" />
                    {addBookMutation.isPending ? "Uploading & Saving..." : "Save Book to Catalog"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Library className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Titles</p>
                <h3 className="text-2xl font-bold">{totalBooks}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Copies</p>
                <h3 className="text-2xl font-bold">{totalAvailable}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full">
                <ArrowLeftRight className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Borrowings</p>
                <h3 className="text-2xl font-bold">{activeBorrowings}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content Area */}
        <Tabs defaultValue="books" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="books" className="gap-2"><Library className="h-4 w-4" /> Catalog</TabsTrigger>
            <TabsTrigger value="borrowings" className="gap-2"><Users className="h-4 w-4" /> Borrowings</TabsTrigger>
          </TabsList>

          {/* BOOKS TAB */}
          <TabsContent value="books">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Library Catalog</CardTitle>
                <CardDescription>Manage your collection of books, PDFs, and availability.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Desktop table */}
                <div className="hidden sm:block rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Title & Author</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Assets</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {booksLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading catalog...</TableCell></TableRow>
                      ) : books?.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No books in the catalog yet.</TableCell></TableRow>
                      ) : (
                        books?.map((book: any) => (
                          <TableRow key={book.id}>
                            <TableCell>
                              <p className="font-medium text-foreground">{book.title}</p>
                              <p className="text-sm text-muted-foreground">{book.author}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant={book.available_copies > 0 ? "secondary" : "destructive"}>
                                {book.available_copies} / {book.total_copies}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {book.pdf_url && <Badge variant="outline" className="gap-1"><FileText className="h-3 w-3" /> PDF</Badge>}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => deleteBookMutation.mutate(book.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {booksLoading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading catalog...</p>
                  ) : books?.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No books in the catalog yet.</p>
                  ) : (
                    books?.map((book: any) => (
                      <div key={book.id} className="rounded-lg border p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-foreground">{book.title}</p>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                          </div>
                          <Badge variant={book.available_copies > 0 ? "secondary" : "destructive"} className="shrink-0">
                            {book.available_copies}/{book.total_copies}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          {book.pdf_url ? <Badge variant="outline" className="gap-1"><FileText className="h-3 w-3" /> PDF</Badge> : <span />}
                          <Button variant="ghost" size="sm" onClick={() => deleteBookMutation.mutate(book.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BORROWINGS TAB */}
          <TabsContent value="borrowings">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <CardTitle>Borrowing History</CardTitle>
                  <CardDescription>Track who has borrowed what, and their return status.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search records..." value={borrowSearch} onChange={(e) => setBorrowSearch(e.target.value)} className="pl-9 w-full sm:w-[200px]" />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="borrowed">Active</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {/* Desktop table */}
                <div className="hidden sm:block rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Borrowed Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {borrowingsLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading records...</TableCell></TableRow>
                      ) : (
                        borrowings
                          ?.filter((b) => {
                            const book = b.books as any;
                            const matchesSearch = !borrowSearch || book?.title?.toLowerCase().includes(borrowSearch.toLowerCase()) || book?.author?.toLowerCase().includes(borrowSearch.toLowerCase());
                            const matchesStatus = statusFilter === "all" || b.status === statusFilter;
                            return matchesSearch && matchesStatus;
                          })
                          .map((b) => {
                            const book = b.books as any;
                            return (
                              <TableRow key={b.id}>
                                <TableCell>
                                  <p className="font-medium">{book?.title || "Unknown Book"}</p>
                                  <p className="text-sm text-muted-foreground">{book?.author}</p>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {format(new Date(b.borrowed_at), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {format(new Date(b.due_date), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge variant={b.status === "borrowed" ? "default" : "secondary"} className={b.status === "borrowed" ? "bg-amber-500 hover:bg-amber-600" : ""}>
                                    {b.status === "borrowed" ? "Active" : "Returned"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {borrowingsLoading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading records...</p>
                  ) : (
                    borrowings
                      ?.filter((b) => {
                        const book = b.books as any;
                        const matchesSearch = !borrowSearch || book?.title?.toLowerCase().includes(borrowSearch.toLowerCase()) || book?.author?.toLowerCase().includes(borrowSearch.toLowerCase());
                        const matchesStatus = statusFilter === "all" || b.status === statusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((b) => {
                        const book = b.books as any;
                        return (
                          <div key={b.id} className="rounded-lg border p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium">{book?.title || "Unknown Book"}</p>
                                <p className="text-xs text-muted-foreground">{book?.author}</p>
                              </div>
                              <Badge variant={b.status === "borrowed" ? "default" : "secondary"} className={`shrink-0 ${b.status === "borrowed" ? "bg-amber-500 hover:bg-amber-600" : ""}`}>
                                {b.status === "borrowed" ? "Active" : "Returned"}
                              </Badge>
                            </div>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>Borrowed: {format(new Date(b.borrowed_at), "MMM d")}</span>
                              <span>Due: {format(new Date(b.due_date), "MMM d")}</span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;