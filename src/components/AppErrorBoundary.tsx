import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || "Something went wrong." };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-background">
          <h1 className="font-display text-xl font-semibold text-foreground">This page hit an error</h1>
          <p className="text-sm text-muted-foreground text-center max-w-md">{this.state.message}</p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, message: "" });
              window.location.assign("/");
            }}
          >
            Go home
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
