// src/client.tsx
import { createInertiaApp, type ResolvedComponent } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import ThemeToggle from "./components/ThemeToggle";

createInertiaApp({
  resolve: async (name) => {
    const pages = import.meta.glob<{ default: ResolvedComponent }>("./pages/**/*.tsx");
    return (await pages[`./pages/${name}.tsx`]()).default;
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <>
        <ThemeToggle />
        <App {...props} />
      </>,
    );
  },
});
