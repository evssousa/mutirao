import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuração mínima. Em desenvolvimento local a API roda em outra porta
// (docs/.env.example, PORTA_API); o proxy evita configurar CORS só para rodar
// localmente.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3333",
    },
  },
});
