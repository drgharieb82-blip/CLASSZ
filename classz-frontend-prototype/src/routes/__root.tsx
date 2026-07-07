import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { AppProvider } from "../lib/app-context";
import { useAuthStore } from "../lib/stores/auth-store";
import { Toaster } from "../components/ui/sonner";
import { AnimatedBackground } from "../components/premium/AnimatedBackground";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error("[CLASSZ] Root error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-lg text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <pre className="mt-4 max-h-40 overflow-auto rounded-lg border bg-muted/50 p-3 text-start text-xs text-destructive">
          {error?.message || "Unknown error"}
          {error?.stack ? `\n\n${error.stack.split("\n").slice(0, 6).join("\n")}` : ""}
        </pre>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <button
            onClick={() => {
              const keys = Object.keys(localStorage).filter((k) => k.startsWith("classz-"));
              keys.forEach((k) => localStorage.removeItem(k));
              window.location.reload();
            }}
            className="inline-flex items-center justify-center rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
          >
            Clear data & reload
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    const { token, logout, login } = useAuthStore.getState();
    if (!token) return;

    // getMeApi() returns the raw backend shape (snake_case public_code, no
    // internalUUID). Route it through login() - the same normalization a
    // fresh sign-in uses - instead of setUser(), which stores the raw
    // response as-is and silently drops/mismaps fields like publicCode.
    import("../lib/api/auth").then(({ getMeApi }) =>
      getMeApi()
        .then((user) => login(token, user))
        .catch(() => logout()),
    );
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AnimatedBackground />
        <Outlet />
        <Toaster position="top-center" richColors closeButton />
      </AppProvider>
    </QueryClientProvider>
  );
}
