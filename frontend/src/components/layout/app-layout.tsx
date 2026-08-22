import { AppHeader } from "./app-header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen pb-20 md:pb-0">{children}</main>
    </>
  );
}
