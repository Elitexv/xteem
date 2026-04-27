/** Non-blank loading shell for route-level and in-page async states. */
const PageLoader = () => (
  <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 px-4 py-16">
    <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    <p className="text-sm text-muted-foreground">Loading…</p>
  </div>
);

export default PageLoader;
