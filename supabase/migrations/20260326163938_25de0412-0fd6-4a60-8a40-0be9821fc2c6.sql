-- Add pdf_url column to books
ALTER TABLE public.books ADD COLUMN pdf_url text;

-- Create storage bucket for book PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('book-pdfs', 'book-pdfs', true);

-- RLS: anyone can read book PDFs
CREATE POLICY "Anyone can read book pdfs"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-pdfs');

-- RLS: admins can upload book PDFs
CREATE POLICY "Admins can upload book pdfs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'));

-- RLS: admins can delete book PDFs
CREATE POLICY "Admins can delete book pdfs"
ON storage.objects FOR DELETE
USING (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'));