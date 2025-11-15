import Nav from "./Nav";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <main className="flex-1 border-2 border-blue-500">
        <div>
          <Nav />
        </div>
        {children}
      </main>
    </div>
  );
}