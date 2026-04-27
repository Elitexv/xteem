import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

type PdfViewerProps = {
  pdfUrl: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PdfViewer = ({ pdfUrl, title, open, onOpenChange }: PdfViewerProps) => {
  // Use Google Docs viewer to prevent download and enable in-browser reading
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 flex-shrink-0 flex flex-row items-start justify-between gap-2 pr-12">
          <DialogTitle className="font-display text-lg">{title}</DialogTitle>
          <Button variant="outline" size="sm" className="shrink-0 gap-1" asChild>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open PDF
            </a>
          </Button>
        </DialogHeader>
        <div className="flex-1 min-h-0 px-4 pb-4 flex flex-col gap-2">
          {open ? (
            <iframe
              key={viewerUrl}
              src={viewerUrl}
              className="w-full min-h-[60vh] flex-1 rounded-lg border"
              title={`Reading: ${title}`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          ) : null}
          <p className="text-xs text-muted-foreground text-center">
            If the preview stays blank, use <span className="font-medium">Open PDF</span> (Google Docs viewer can block some hosts).
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;
