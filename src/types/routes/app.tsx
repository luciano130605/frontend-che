import { createFileRoute, redirect } from "@tanstack/react-router";
import AppHeader from "../../components/layout/AppHeader";
import AppView from "../../components/tasks/AppView";
import { getSession } from "../../auth";

function AppRoute() {
  return (
    <>
      <AppHeader />
      <AppView />
    </>
  );
}

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    const session = getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppRoute,
});
