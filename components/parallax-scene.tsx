"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * A stack of layers that drift apart as the reader scrolls past, and lean with
 * the pointer on devices that have one.
 *
 * The scene itself is a plain server-rendered subtree: the layers are marked
 * up with data attributes and this wrapper wires them to one ScrollTrigger.
 *
 *   data-parallax-y="18"        yPercent at the end of the pass (start: 0)
 *   data-parallax-from-y="100"  yPercent at the start, for things that rise in
 *   data-parallax-x="6"         xPercent at the end
 *   data-parallax-scale="1.08"  scale at the end
 *   data-parallax-origin="63% 8%" transform origin for the scale (default centre)
 *   data-parallax-end="0.55"    finish this layer at a fraction of the pass
 *   data-drift="1.4"            pointer lean, in % of the scene's width
 *
 * The pass runs from the scene's top meeting the bottom of the viewport to its
 * bottom meeting the top, clamped to the page - so for the first scene on the
 * page the pass begins at scroll 0, and every layer is at its start value on
 * load rather than part-way along.
 *
 * Every value is a transform on its own element. Layers that both scroll and
 * lean use two nested elements, the scroll one outside, so the two tweens
 * never write the same transform.
 */
export function ParallaxScene({
  children,
  className,
  style,
  id,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scene = root.current;
      if (!scene) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          pointer: "(hover: hover) and (pointer: fine)",
        },
        (context) => {
          const { motion, pointer } = context.conditions ?? {};
          if (!motion) return;

          const layers = gsap.utils.toArray<HTMLElement>(
            "[data-parallax-y], [data-parallax-x], [data-parallax-scale]",
            scene,
          );

          if (layers.length) {
            const timeline = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: scene,
                start: "clamp(top bottom)",
                end: "clamp(bottom top)",
                scrub: true,
                invalidateOnRefresh: true,
              },
            });

            for (const layer of layers) {
              const {
                parallaxY,
                parallaxFromY,
                parallaxX,
                parallaxScale,
                parallaxOrigin,
              } = layer.dataset;
              const end = Number(layer.dataset.parallaxEnd ?? 1);
              timeline.fromTo(
                layer,
                {
                  yPercent: Number(parallaxFromY ?? 0),
                  xPercent: 0,
                  scale: 1,
                  transformOrigin: parallaxOrigin ?? "50% 50%",
                },
                {
                  yPercent: Number(parallaxY ?? 0),
                  xPercent: Number(parallaxX ?? 0),
                  scale: Number(parallaxScale ?? 1),
                  duration: end,
                },
                0,
              );
            }
          }

          if (!pointer) return;

          const drifters = gsap.utils
            .toArray<HTMLElement>("[data-drift]", scene)
            .map((el) => {
              const amount = Number(el.dataset.drift);
              // Room to lean without showing the scene's edge behind it.
              gsap.set(el, {
                scale: 1 + amount / 40,
                transformOrigin: "50% 0%",
              });
              return {
                amount,
                x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }),
                y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }),
              };
            });
          if (!drifters.length) return;

          let frame = 0;
          let px = 0;
          let py = 0;
          const paint = () => {
            frame = 0;
            const unit = scene.clientWidth / 100;
            for (const drifter of drifters) {
              drifter.x(px * drifter.amount * unit);
              drifter.y(py * drifter.amount * unit * 0.6);
            }
          };
          const onMove = (event: PointerEvent) => {
            px = event.clientX / window.innerWidth - 0.5;
            py = event.clientY / window.innerHeight - 0.5;
            if (!frame) frame = requestAnimationFrame(paint);
          };
          const onLeave = () => {
            px = 0;
            py = 0;
            if (!frame) frame = requestAnimationFrame(paint);
          };

          window.addEventListener("pointermove", onMove, { passive: true });
          document.addEventListener("pointerleave", onLeave);
          return () => {
            window.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerleave", onLeave);
            if (frame) cancelAnimationFrame(frame);
          };
        },
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} id={id} className={className} style={style}>
      {children}
    </div>
  );
}
