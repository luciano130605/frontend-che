import { createFileRoute, useNavigate } from "@tanstack/react-router";
import AuthView from "../../components/AuthView";
import { saveSession, type AuthSession } from "../../auth";

function RegisterRoute() {
  const navigate = useNavigate();

  function handleAuthSuccess(session: AuthSession) {
    saveSession(session);
    navigate({ to: "/app" });
  }

  return <AuthView initialTab="register" onAuthSuccess={handleAuthSuccess} />;
}

export const Route = createFileRoute("/register")({
  component: RegisterRoute,
});
