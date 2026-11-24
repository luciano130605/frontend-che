import { createFileRoute } from "@tanstack/react-router";
import PrivacidadPage from "../../pages/Privacidadpage";

export const Route = createFileRoute("/privacidad")({
  component: PrivacidadPage,
});