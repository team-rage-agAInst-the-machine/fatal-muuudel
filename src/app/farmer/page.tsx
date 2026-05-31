import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { Starfield } from "@/components/fatal/Starfield";
import { Saucer } from "@/components/fatal/Saucer";
import { FarmerCowForm } from "@/components/fatal/FarmerCowForm";

const FARMER_EMAIL = "erick.szns@gmail.com";

export default async function FarmerPage() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== FARMER_EMAIL) {
    redirect("/swipe");
  }

  return (
    <div className="fm-stage">
      <Starfield enabled count={90} />
      <div className="fm-app">
        <div className="fm-topbar">
          <Link href="/swipe" className="fm-tab" title="Voltar">
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
            <span>FAZENDEIRO</span>
          </div>
          <div style={{ width: 40 }} />
        </div>
        <FarmerCowForm />
      </div>
    </div>
  );
}
