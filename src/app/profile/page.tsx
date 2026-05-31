import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Starfield } from "@/components/fatal/Starfield";
import { ProfileScreen } from "@/components/fatal/ProfileScreen";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      callsign: true,
      homePlanet: true,
      shipModel: true,
      towelStatus: true,
      mooPreference: true,
      maxCargoKg: true,
      abductionStyle: true,
      temperamento: true,
      signoGalactico: true,
      objetivoDaMissao: true,
    },
  });

  if (!user) redirect("/");

  return (
    <div className="fm-stage">
      <Starfield enabled count={90} />
      <div className="fm-app">
        <ProfileScreen user={user} />
      </div>
    </div>
  );
}
