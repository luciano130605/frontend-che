import { createFileRoute } from "@tanstack/react-router";
import TerminosPage from "../../pages/TerminosPage";

export const Route = createFileRoute("/terminos")({
  component: TerminosPage,
});