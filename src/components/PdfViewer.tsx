import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
        <DialogHeader className="p-4 pb-2 flex-shrink-0">
          <DialogTitle className="font-display text-lg pr-8">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 px-4 pb-4">
          {open ? (
            <iframe
              key={viewerUrl}
              src={viewerUrl}
              className="w-full h-full rounded-lg border"
              title={`Reading: ${title}`}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;
