import Image from "next/image";

import dragonfly from "@/assets/images/mascots/dragonfly.webp";
import jaguar from "@/assets/images/mascots/jaguar.webp";
import octopus from "@/assets/images/mascots/octopus.webp";
import raccoon from "@/assets/images/mascots/raccoon_walk.webp";

/** Small, non-interactive characters that wander around the viewport. */
export function RoamingMascots() {
  return (
    <div className="roaming-mascots" aria-hidden>
      <div className="roaming-mascot roaming-mascot--dragonfly">
        <Image
          src={dragonfly}
          alt=""
          sizes="(max-width: 640px) 48px, 68px"
          className="h-auto w-full"
        />
      </div>

      <div className="roaming-mascot roaming-mascot--octopus">
        <Image
          src={octopus}
          alt=""
          sizes="(max-width: 640px) 52px, 72px"
          className="h-auto w-full"
        />
      </div>

      <div className="roaming-mascot roaming-mascot--raccoon">
        <Image
          src={raccoon}
          alt=""
          sizes="(max-width: 640px) 48px, 68px"
          className="h-auto w-full"
        />
      </div>

      <div className="roaming-mascot roaming-mascot--jaguar">
        <Image
          src={jaguar}
          alt=""
          sizes="(max-width: 640px) 96px, 140px"
          className="roaming-mascot__jaguar h-auto w-full"
        />
      </div>
    </div>
  );
}
