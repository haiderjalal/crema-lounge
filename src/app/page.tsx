import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Story } from "@/components/sections/Story";
import { Signature } from "@/components/sections/Signature";
import { MenuPreview } from "@/components/sections/MenuPreview";
import { Events } from "@/components/sections/Events";
import { Gallery } from "@/components/sections/Gallery";
import { Visit } from "@/components/sections/Visit";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Story />
      <Signature />
      <MenuPreview />
      <Events />
      <Gallery />
      <Visit />
    </>
  );
}
