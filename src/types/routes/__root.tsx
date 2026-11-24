import { createRootRoute, Outlet } from "@tanstack/react-router";
import NotFound from "../../pages/NotFound";
import UpdatePrompt from "../../components/pwa/UpdatePrompt";
import Footer from "../../components/landing/Footer";

export const Route = createRootRoute({
    component: () => (
        // El footer va acá, una sola vez, para que aparezca en toda la app (con o sin sesión).
        <div className="app-root flex min-h-screen flex-col">
            <div className="flex-1">
                <Outlet />
            </div>
            <Footer />
            <UpdatePrompt />
        </div>
    ),
    notFoundComponent: NotFound,
});
