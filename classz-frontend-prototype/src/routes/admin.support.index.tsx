import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/support/")({
  component: () => <Navigate to="/admin/support/tickets" />,
});
