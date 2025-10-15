import Nav from "./Nav";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen min-w-screen">
      <Nav />
      {/* This grows to fill the remaining space */}
      <main className="flex flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
