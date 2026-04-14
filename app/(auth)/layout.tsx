export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="app-container">
      {children}
    </div>
  );
}
