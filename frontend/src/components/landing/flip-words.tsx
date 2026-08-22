"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";

interface FlipWordsProps {
  words: string[];
  interval?: number;
}

export function FlipWords({ words, interval = 2600 }: FlipWordsProps) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setIndex((value) => (value + 1) % words.length);
    }, interval);

    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="relative inline-flex min-w-[170px] justify-start font-semibold text-primary sm:min-w-[210px]">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 14, opacity: 0, filter: "blur(5px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -14, opacity: 0, filter: "blur(5px)" }}
          transition={{ duration: 0.3 }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
