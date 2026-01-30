'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Participant {
  id: string;
  name: string;
  nim: string;
}

interface SlotMachineProps {
  participants: Participant[];
  isRolling: boolean;
  onComplete: () => void;
}

export default function SlotMachine({ participants, isRolling, onComplete }: SlotMachineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(50);

  useEffect(() => {
    if (!isRolling) {
      setSpeed(50);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let startTime = Date.now();
    const duration = 3000; // 3 seconds

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function - starts fast, ends slow
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentSpeed = 50 + easeOut * 450; // From 50ms to 500ms

      setSpeed(currentSpeed);
      setCurrentIndex((prev) => (prev + 1) % participants.length);

      if (progress < 1) {
        timeoutId = setTimeout(animate, currentSpeed);
      } else {
        onComplete();
      }
    };

    animate();

    return () => clearTimeout(timeoutId);
  }, [isRolling, participants.length, onComplete]);

  if (participants.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        No eligible participants available
      </div>
    );
  }

  const currentParticipant = participants[currentIndex];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 rounded-2xl p-8 shadow-2xl">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentParticipant.id}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="relative z-10 text-center"
        >
          <div className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {currentParticipant.name}
          </div>
          <div className="text-3xl text-purple-200 font-mono">
            {currentParticipant.nim}
          </div>
        </motion.div>
      </AnimatePresence>

      {isRolling && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"></div>
        </motion.div>
      )}
    </div>
  );
}
