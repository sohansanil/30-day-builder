'use client';

import { useEffect } from 'react';
import { motion, useAnimate, stagger } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  duration?: number;
  filter?: boolean;
}

export function TextGenerateEffect({
  words,
  className,
  duration = 0.5,
  filter = true,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(' ');

  useEffect(() => {
    animate(
      'span',
      { opacity: 1, filter: filter ? 'blur(0px)' : 'none' },
      { duration, delay: stagger(0.13) }
    );
  }, [scope, animate, duration, filter]);

  return (
    <div className={cn('font-display', className)}>
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => (
          <motion.span
            key={idx}
            className="opacity-0 inline-block"
            style={{ filter: filter ? 'blur(10px)' : 'none', marginRight: '0.28em' }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
