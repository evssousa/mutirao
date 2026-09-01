// Ponto de entrada do front-end. Monta o React na div#raiz de index.html.
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import "./index.css";

const clienteQuery = new QueryClient();

ReactDOM.createRoot(document.getElementById("raiz")!).render(
  <React.StrictMode>
    <QueryClientProvider client={clienteQuery}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
