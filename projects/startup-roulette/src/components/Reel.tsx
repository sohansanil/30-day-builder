"use client";

import { motion } from "framer-motion";

interface ReelProps {
  items: string[];
  spinning: boolean;
  selectedItemIndex: number;
  spinCount: number;
}

export function Reel({ items, spinning, selectedItemIndex, spinCount }: ReelProps) {
  const ITEM_HEIGHT = 120; // Increased height to allow for multi-line wrapped text

  return (
    <div 
      className="relative flex-1 w-full min-w-[200px] h-[120px] bg-casino-bg-light rounded-xl overflow-hidden shadow-inner border-2 border-casino-bg/50"
      style={{ height: ITEM_HEIGHT }}
    >
      {/* Glossy overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      
      <motion.div
        key={spinCount}
        className="absolute top-0 w-full flex flex-col"
        initial={{ y: 0 }}
        animate={{
          y: spinning 
            ? -(items.length - 1) * ITEM_HEIGHT // Spin all the way down
            : -selectedItemIndex * ITEM_HEIGHT, // Settle on the target
        }}
        transition={{
          y: spinning
            ? {
                duration: 2.5,
                ease: [0.1, 0.7, 0.1, 1], // Custom casino slow-down ease
              }
            : {
                type: "spring",
                stiffness: 150,
                damping: 15,
              },
        }}
      >
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="w-full flex items-center justify-center px-4 text-center"
            style={{ height: ITEM_HEIGHT }}
          >
            <span 
              className={`font-bold tracking-tight text-white leading-snug transition-all duration-300
                ${spinning ? "blur-[2px]" : "blur-0"}
                text-base md:text-lg lg:text-xl line-clamp-3
              `}
              style={{ textWrap: 'balance' }}
            >
              {item}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
