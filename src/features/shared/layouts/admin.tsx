import Header from "@/features/shared/components/Header";
import { Invitation } from "@/types";
import { preload } from "react-dom";

export default function AdminLayout({
  children,
  invitationData
}: {
  children: React.ReactNode;
  invitationData?: Invitation | null
}) {
  preload("/img/textures/cream-paper.png", { as: "image" });

  return (
    <div className="font-sans antialiased bg-paper min-h-screen text-charcoal-600 selection:bg-gold selection:text-white flex flex-col scrollbar-hide">
      <div className="fixed inset-0 opacity-[0.4] mix-blend-multiply bg-[url('/img/textures/cream-paper.png')] bg-repeat pointer-events-none"></div>
      <Header invitationData={invitationData} />
      <main className="flex-grow flex-1 relative">{children}</main>
    </div>
  );
}
