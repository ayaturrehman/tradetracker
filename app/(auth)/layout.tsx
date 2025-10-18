export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-foreground/10 bg-background p-8 shadow-lg shadow-foreground/5">
        {children}
      </div>
    </div>
  );
}
