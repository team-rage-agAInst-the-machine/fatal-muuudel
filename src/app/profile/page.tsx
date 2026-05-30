import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Starfield } from "@/components/fatal/Starfield";
import { Saucer } from "@/components/fatal/Saucer";
import { ProfileScreen } from "@/components/fatal/ProfileScreen";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      image: true,
      callsign: true,
      homePlanet: true,
      shipModel: true,
    },
  });

  if (!user) redirect("/");

  return (
    <div className="fm-stage">
      <Starfield enabled count={90} />
      <div className="fm-app">
        <div className="fm-topbar">
          <Link href="/" className="fm-tab" title="Voltar">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
          </Link>
          <div className="fm-logo">
            <Saucer className="saucer" />
            <span>PERFIL ET</span>
          </div>
          <div style={{ width: 40 }} />
        </div>
        <ProfileScreen user={user} />
      </div>
    </div>
  );
}
