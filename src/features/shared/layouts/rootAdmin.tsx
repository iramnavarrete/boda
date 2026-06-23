import Header from "@/features/shared/components/Header";
import { preload } from "react-dom";
import React from "react";

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  preload("/img/textures/cream-paper.png", { as: "image" });

  return (
    <div className="font-sans antialiased bg-paper min-h-screen text-charcoal-600 selection:bg-gold selection:text-white flex flex-col scrollbar-hide">
      <div className="fixed inset-0 opacity-[0.4] mix-blend-multiply bg-[url('/img/textures/cream-paper.png')] bg-repeat pointer-events-none z-0"></div>
      
      <Header 
        variant="invitations-panel" 
      />
      
      <main className="flex-grow flex-1 relative w-full">
        {children}
      </main>
    </div>
  );
}