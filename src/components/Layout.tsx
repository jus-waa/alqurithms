import Nav from "./Nav";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col h-screen w-screen">
      <div>
        <Nav />
      </div>
      <main className="flex flex-col flex-1 p-6"> {/* border-2 border-blue-500 */}
        {children}
      </main>
    </div>
  );
}