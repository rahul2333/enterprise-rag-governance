import { useState } from "react";
import { Layout } from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentLibraryPage } from "./pages/DocumentLibraryPage";
import { EvaluationDashboardPage } from "./pages/EvaluationDashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ReviewQueuePage } from "./pages/ReviewQueuePage";
import { RiskRegisterPage } from "./pages/RiskRegisterPage";
import { SettingsPage } from "./pages/SettingsPage";
import { UploadPage } from "./pages/UploadPage";

function renderPage(activePage: string) {
  switch (activePage) {
    case "chat":
      return <ChatPage />;
    case "documents":
      return <DocumentLibraryPage />;
    case "upload":
      return <UploadPage />;
    case "audit":
      return <AuditLogsPage />;
    case "evaluations":
      return <EvaluationDashboardPage />;
    case "review":
      return <ReviewQueuePage />;
    case "risks":
      return <RiskRegisterPage />;
    case "settings":
      return <SettingsPage />;
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
