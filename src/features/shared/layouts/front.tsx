import {
  newIconScript,
  nourdBold,
  nourdLight,
  nourdMedium,
  autography,
  comprehensionDark,
  comprehensionSemiBold,
  aboveBeyondScript
} from "@/features/shared/fonts";

export default function FrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className={`${newIconScript.variable} ${nourdLight.variable} ${nourdMedium.variable} ${nourdBold.variable} ${autography.variable} ${comprehensionDark.variable} ${comprehensionSemiBold.variable} ${aboveBeyondScript.variable} bg-primary text-charcoal min-h-screen relative overflow-hidden`}>
      {children}
    </main>
  );
}
