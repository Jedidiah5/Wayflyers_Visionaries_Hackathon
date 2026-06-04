export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col bg-[#0a0a0a] sm:top-16">
      {children}
    </div>
  );
}
