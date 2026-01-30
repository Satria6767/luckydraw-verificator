'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SlotMachine from '@/components/SlotMachine';
import WinnerCard from '@/components/WinnerCard';
import { Gift, Sparkles, CheckCircle, Trophy, Users, AlertCircle, Settings } from 'lucide-react';
import Link from 'next/link';

interface Participant {
  id: string;
  name: string;
  nim: string;
  is_winner: number;
}

interface Prize {
  id: string;
  prize_name: string;
  initial_quota: number;
  current_quota: number;
}

export default function Home() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [selectedPrizeId, setSelectedPrizeId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [eligibleParticipants, setEligibleParticipants] = useState<Participant[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [tentativeWinners, setTentativeWinners] = useState<Participant[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [stats, setStats] = useState({ totalParticipants: 0, eligibleParticipants: 0, totalPrizes: 0 });

  useEffect(() => {
    loadPrizes();
    loadEligibleParticipants();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [participantsRes, eligibleRes, prizesRes] = await Promise.all([
        fetch('/api/participants'),
        fetch('/api/participants/eligible'),
        fetch('/api/prizes')
      ]);

      const participantsData = await participantsRes.json();
      const eligibleData = await eligibleRes.json();
      const prizesData = await prizesRes.json();

      setStats({
        totalParticipants: participantsData.data?.length || 0,
        eligibleParticipants: eligibleData.data?.length || 0,
        totalPrizes: prizesData.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadPrizes = async () => {
    try {
      const response = await fetch('/api/prizes/available');
      const data = await response.json();
      if (data.success) {
        setPrizes(data.data);
        if (data.data.length > 0 && !selectedPrizeId) {
          setSelectedPrizeId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading prizes:', error);
    }
  };

  const loadEligibleParticipants = async () => {
    try {
      const response = await fetch('/api/participants/eligible');
      const data = await response.json();
      if (data.success) {
        setEligibleParticipants(data.data);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const handleRoll = async () => {
    if (!selectedPrizeId || quantity < 1) {
      showMessage('error', 'Please select a prize and valid quantity');
      return;
    }

    setMessage(null);
    setIsRolling(true);
    setShowResults(false);

    try {
      const response = await fetch('/api/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prizeId: selectedPrizeId, quantity }),
      });

      const data = await response.json();

      if (data.success) {
        // Wait for animation to complete
        setTimeout(() => {
          setTentativeWinners(data.data.winners);
          setShowResults(true);
        }, 3000);
      } else {
        setIsRolling(false);
        showMessage('error', data.error);
      }
    } catch (error: any) {
      setIsRolling(false);
      showMessage('error', 'Failed to draw winners');
    }
  };

  const handleRemoveWinner = (id: string) => {
    setTentativeWinners((prev) => prev.filter((w) => w.id !== id));
  };

  const handleConfirmWinners = async () => {
    if (tentativeWinners.length === 0) {
      showMessage('error', 'No winners to confirm');
      return;
    }

    setIsConfirming(true);

    try {
      const response = await fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIds: tentativeWinners.map((w) => w.id),
          prizeId: selectedPrizeId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', data.message);

        // Reset state
        setTentativeWinners([]);
        setShowResults(false);
        setIsRolling(false);

        // Reload data
        await loadPrizes();
        await loadEligibleParticipants();
        await loadStats();
      } else {
        showMessage('error', data.error);
      }
    } catch (error: any) {
      showMessage('error', 'Failed to confirm winners');
    } finally {
      setIsConfirming(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const selectedPrize = prizes.find((p) => p.id === selectedPrizeId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-3">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AGIT ECM 2026 Doorprize</h1>
                <p className="text-sm text-gray-500 mt-1">Professional Prize Draw System</p>
              </div>
            </div>

            <Link
              href="/admin"
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Participants</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalParticipants}</p>
              </div>
              <Users className="w-12 h-12 text-purple-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Eligible to Win</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.eligibleParticipants}</p>
              </div>
              <Sparkles className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Available Prizes</p>
                <p className="text-3xl font-bold text-pink-600 mt-1">{stats.totalPrizes}</p>
              </div>
              <Gift className="w-12 h-12 text-pink-400" />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Alert */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
                }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Gift className="w-6 h-6 mr-2 text-purple-500" />
            Draw Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Prize
              </label>
              <select
                value={selectedPrizeId}
                onChange={(e) => setSelectedPrizeId(e.target.value)}
                disabled={isRolling || showResults}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {prizes.length === 0 ? (
                  <option>No prizes available</option>
                ) : (
                  prizes.map((prize) => (
                    <option key={prize.id} value={prize.id}>
                      {prize.prize_name} (Stock: {prize.current_quota})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Winners
              </label>
              <input
                type="number"
                min="1"
                max={selectedPrize?.current_quota || 1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                disabled={isRolling || showResults}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRoll}
                disabled={isRolling || showResults || prizes.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isRolling ? 'ROLLING...' : 'ROLL NOW'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Slot Machine Animation */}
        {(isRolling || showResults) && eligibleParticipants.length > 0 && (
          <div className="mb-8">
            <SlotMachine
              participants={eligibleParticipants}
              isRolling={isRolling}
              onComplete={() => setIsRolling(false)}
            />
          </div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {showResults && tentativeWinners.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                    Tentative Winners ({tentativeWinners.length})
                  </h2>

                  <button
                    onClick={handleConfirmWinners}
                    disabled={isConfirming || tentativeWinners.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{isConfirming ? 'CONFIRMING...' : 'CONFIRM ALL WINNERS'}</span>
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Verification Step:</strong> Call each name. If absent, click the ❌ button to remove them before confirming.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {tentativeWinners.map((winner, index) => (
                      <WinnerCard
                        key={winner.id}
                        participant={winner}
                        index={index}
                        onRemove={handleRemoveWinner}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>AGIT ECM 2026 Doorprize System v1.0 • Built with Next.js & SQLite</p>
        </div>
      </footer>
    </div>
  );
}
