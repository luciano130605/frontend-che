import { createFileRoute, useNavigate } from "@tanstack/react-router";
import AuthView from "../../components/AuthView";
import { saveSession, type AuthSession } from "../../auth";

function LoginRoute() {
  const navigate = useNavigate();

  function handleAuthSuccess(session: AuthSession) {
    saveSession(session);
    navigate({ to: "/app" });
  }

  return <AuthView initialTab="login" onAuthSuccess={handleAuthSuccess} />;
}

export const Route = createFileRoute("/login")({
  component: LoginRoute,
});
