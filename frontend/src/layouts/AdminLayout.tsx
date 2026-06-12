import { Shell } from "../components/Shell";

export function AdminLayout() {
  return (
    <Shell
      title="i18n:shell.adminTitle"
      roleLabel="i18n:roles.adminWorkspace"
      accent="linear-gradient(90deg, #e85d3f, #18a999, #253129)"
    />
  );
}
