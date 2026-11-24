import { createFileRoute, redirect } from "@tanstack/react-router";
import AppHeader from "../../components/layout/AppHeader";
import ProfileView from "../../components/ProfileView";
import { getSession } from "../../auth";
import AccountLayout from "../../components/AccountLayout"; // Layout

function ProfileRoute() {
  return (
    <>
      <AppHeader />
     {/*  <ProfileView /> */}
     <AccountLayout /> {/* <- Renderiza AccountLayout */}
    </>
  );
}

export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    const session = getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: ProfileRoute,
});
