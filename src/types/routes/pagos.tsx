import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "../../auth";
import PaymentPage from "../../pages/PaymentPage";

export const Route = createFileRoute("/pagos")({
  beforeLoad: () => {
    if (!getSession()) {
      throw redirect({ to: "/register" });
    }
  },
  // Mercado Pago vuelve a esta ruta con ?preapproval_id=...
  validateSearch: (search: Record<string, unknown>): { plan: "pro"; periodo: "mensual" | "anual"; preapproval_id?: string } => ({
    plan: "pro",
    periodo: search.periodo === "anual" ? "anual" : "mensual",
    preapproval_id: typeof search.preapproval_id === "string" ? search.preapproval_id : undefined,
  }),
  component: PaymentRoute,
});

function PaymentRoute() {
  const { periodo, preapproval_id } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <PaymentPage
      period={periodo}
      preapprovalId={preapproval_id}
      onPeriodChange={(periodo) => {
        void navigate({ search: { plan: "pro", periodo }, replace: true });
      }}
    />
  );
}
