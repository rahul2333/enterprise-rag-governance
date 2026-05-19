import { FileText, LayoutDashboard, LogOut, MessageSquare, ShieldCheck, Upload } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface LayoutProps {
  activePage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "upload", label: "Upload", icon: Upload },
  { id: "governance", label: "Governance", icon: ShieldCheck }
];

export function Layout({ activePage, onNavigate, children }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">RG</span>
          <div>
            <strong>Enterprise RAG</strong>
            <span>Governance Platform</span>
          </div>
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={activePage === item.id ? "nav-item active" : "nav-item"}
                onClick={() => onNavigate(item.id)}
                type="button"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div>
            <strong>{user?.full_name}</strong>
            <span>{user?.role}</span>
          </div>
          <button className="icon-button" onClick={logout} type="button" title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
