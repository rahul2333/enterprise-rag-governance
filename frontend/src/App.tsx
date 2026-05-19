import { useState } from "react";
import { Layout } from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentLibraryPage } from "./pages/DocumentLibraryPage";
import { GovernancePage } from "./pages/GovernancePage";
import { LoginPage } from "./pages/LoginPage";
import { UploadPage } from "./pages/UploadPage";

function renderPage(activePage: string) {
  switch (activePage) {
    case "chat":
      return <ChatPage />;
    case "documents":
      return <DocumentLibraryPage />;
    case "upload":
      return <UploadPage />;
    case "governance":
      return <GovernancePage />;
    default:
      return <DashboardPage />;
  }
}

export default function App() {
  const { user, isLoading } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");

  if (isLoading) {
    return <div className="loading">Loading platform...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {renderPage(activePage)}
    </Layout>
  );
}
