import { createFileRoute } from "@tanstack/react-router";
import FaqsPage from "../../pages/Faqspage";

export const Route = createFileRoute("/faqs")({
  component: FaqsPage,
});