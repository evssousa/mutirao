// Tela provisória da Fase 0: só confirma que o front conversa com a API
// e com o banco, via GET /api/saude (apps/api/src/servidor.ts).
// As telas reais do MVP estão listadas em docs/plan.md, seção 14.
import { useQuery } from "@tanstack/react-query";

type RespostaSaude = { status: string };

async function buscarSaude(): Promise<RespostaSaude> {
  const resposta = await fetch("/api/saude");
  if (!resposta.ok) throw new Error("API não respondeu");
  return resposta.json();
}

export function App() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["saude"],
    queryFn: buscarSaude,
  });

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-800">Mutirão</h1>
        <p className="text-neutral-500">
          {isLoading && "Carregando..."}
          {isError && "API indisponível — confira se `npm run dev` está rodando."}
          {data && `API: ${data.status}`}
        </p>
      </div>
    </main>
  );
}
