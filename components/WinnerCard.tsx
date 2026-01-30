'use client';

import { motion } from 'framer-motion';
import { X, User } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  nim: string;
}

interface WinnerCardProps {
  participant: Participant;
  index: number;
  onRemove: (id: string) => void;
}

export default function WinnerCard({ participant, index, onRemove }: WinnerCardProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative group"
    >
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-purple-400">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2"></div>
        
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-full p-3">
                <User className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {participant.name}
                </h3>
                <p className="text-sm text-gray-500 font-mono">
                  NIM: {participant.nim}
                </p>
              </div>
            </div>

            <button
              onClick={() => onRemove(participant.id)}
              className="ml-4 p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 group-hover:scale-110"
              title="Remove from winners list"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
