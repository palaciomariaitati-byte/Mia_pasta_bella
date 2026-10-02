export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-crema-100">
      {/* El Navbar y Footer dinámicos se integrarán en el siguiente paso */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
