import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-950 via-purple-950 to-zinc-950 px-6 py-24 text-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.25),transparent_60%)]" />

      <main className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-10 text-center">
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
          BETA · Acesso restrito a ETs cadastrados
        </Badge>

        <h1 className="bg-gradient-to-br from-purple-300 via-fuchsia-200 to-emerald-200 bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-7xl">
          Fatal Muuudel
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-zinc-300">
          O catálogo definitivo para civilizações extraterrestres escolherem
          quais vacas vão abduzir nesta temporada. Dê &quot;like&quot; para
          marcar a abdução, ou passe para a próxima.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-purple-500 hover:bg-purple-400">
            <Link href="/swipe">Começar a abduzir</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-zinc-700 bg-zinc-900/40 text-zinc-100 hover:bg-zinc-800">
            <Link href="/login">Login ET</Link>
          </Button>
        </div>

        <Card className="mt-8 w-full border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <CardContent className="grid gap-4 p-6 text-left text-sm text-zinc-300 sm:grid-cols-3">
            <div>
              <p className="font-semibold text-zinc-100">🛸 Swipe estelar</p>
              <p className="text-zinc-400">Like vira plano de abdução; pass joga no espaço.</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-100">🐄 Catálogo bovino</p>
              <p className="text-zinc-400">Raça, peso, vibe e bio de cada bovino disponível.</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-100">📋 Painel de naves</p>
              <p className="text-zinc-400">Acompanhe suas abduções planejadas e concluídas.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
