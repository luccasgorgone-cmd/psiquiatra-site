"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export default function ParallaxImage({
  src,
  alt,
  className = "",
  amount = 40,
  rounded = "rounded-[1.75rem]",
}: {
  src: string;
  alt: string;
  className?: string;
  amount?: number;
  rounded?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-amount, amount]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${rounded} ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={reduce ? undefined : { y, scale: 1.12 }}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
