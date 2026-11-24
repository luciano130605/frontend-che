import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import "./index.css";
import { router } from "./router";
import { AvatarMoodProvider } from "./components/avatar/avatar-mood-context";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AvatarMoodProvider>
      <RouterProvider router={router} />
    </AvatarMoodProvider>
  </StrictMode>,
);