import { navItems } from "../../data/mockData";

export function AppShell({ activeView, onNavigate, title, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <nav>
          {navItems.map(([id, label]) => (
            <button
              key={id}
              className={activeView === id ? "active" : ""}
              onClick={() => onNavigate(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
