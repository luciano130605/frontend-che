import { createFileRoute } from "@tanstack/react-router";
import ContactoPage from "../../pages/Contacto";

export const Route = createFileRoute("/contacto")({
  component: ContactoPage,
});