'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Gift, Trophy, ArrowLeft, RefreshCw, Plus, Edit, Trash2, X, Save } from 'lucide-react';
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

interface Winner {
  id: string;
  name: string;
  nim: string;
  prize_name: string;
  won_at: string;
}

export default function AdminPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [activeTab, setActiveTab] = useState<'participants' | 'prizes' | 'winners'>('participants');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'participant' | 'prize' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [participantsRes, prizesRes, winnersRes] = await Promise.all([
        fetch('/api/participants'),
        fetch('/api/prizes'),
        fetch('/api/winners')
      ]);

      const participantsData = await participantsRes.json();
      const prizesData = await prizesRes.json();
      const winnersData = await winnersRes.json();

      if (participantsData.success) setParticipants(participantsData.data);
      if (prizesData.success) setPrizes(prizesData.data);
      if (winnersData.success) setWinners(winnersData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const openModal = (type: 'participant' | 'prize', item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item || (type === 'participant' ? { name: '', nim: '' } : { prizeName: '', quota: 1 }));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
    setFormData({});
  };

  const handleDelete = async (type: 'participant' | 'prize' | 'winner', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const endpoint = type === 'participant' ? '/api/participants'
        : type === 'prize' ? '/api/prizes'
          : '/api/winners';

      const res = await fetch(`${endpoint}?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = modalType === 'participant' ? '/api/participants' : '/api/prizes';
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { ...formData, id: editingItem.id } : formData;

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        loadData();
        closeModal();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-3">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Manage participants, prizes, and winners</p>
              </div>
            </div>

            <Link
              href="/"
              className="flex items-center space-x-2 bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 hover:border-purple-300 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Draw</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center space-x-2 ${activeTab === 'participants'
                  ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Users className="w-5 h-5" />
              <span>Participants ({participants.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('prizes')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center space-x-2 ${activeTab === 'prizes'
                  ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Gift className="w-5 h-5" />
              <span>Prizes ({prizes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('winners')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center space-x-2 ${activeTab === 'winners'
                  ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Trophy className="w-5 h-5" />
              <span>Winners ({winners.length})</span>
            </button>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {activeTab === 'participants' && 'All Participants'}
                {activeTab === 'prizes' && 'All Prizes'}
                {activeTab === 'winners' && 'Winner History'}
              </h2>

              <div className="flex space-x-3">
                <button
                  onClick={loadData}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>

                {activeTab === 'participants' && (
                  <button
                    onClick={() => openModal('participant')}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Participant</span>
                  </button>
                )}

                {activeTab === 'prizes' && (
                  <button
                    onClick={() => openModal('prize')}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Prize</span>
                  </button>
                )}
              </div>
            </div>

            {/* Participants Table */}
            {activeTab === 'participants' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NIM</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {participants.map((participant) => (
                      <motion.tr
                        key={participant.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {participant.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-sm">
                          {participant.nim}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {participant.is_winner ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              Winner
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              Eligible
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openModal('participant', participant)}
                            className="text-purple-600 hover:text-purple-900 mr-4"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete('participant', participant.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Prizes Table */}
            {activeTab === 'prizes' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prize Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Initial</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Current</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {prizes.map((prize) => (
                      <motion.tr
                        key={prize.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {prize.prize_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {prize.initial_quota}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-bold ${prize.current_quota > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {prize.current_quota}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {prize.current_quota > 0 ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openModal('prize', prize)}
                            className="text-purple-600 hover:text-purple-900 mr-4"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete('prize', prize.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Winners Table */}
            {activeTab === 'winners' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NIM</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prize</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Won At</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {winners.map((winner) => (
                      <motion.tr
                        key={winner.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {winner.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-sm">
                          {winner.nim}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            {winner.prize_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                          {new Date(winner.won_at).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDelete('winner', winner.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Remove winner & restore quota"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {winners.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No winners yet. Start drawing prizes!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit' : 'Add'} {modalType === 'participant' ? 'Participant' : 'Prize'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {modalType === 'participant' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g., John Doe"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NIM / ID</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g., 12345678"
                        value={formData.nim || ''}
                        onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {modalType === 'prize' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prize Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g., Bicycle"
                        value={formData.prizeName || ''}
                        onChange={(e) => setFormData({ ...formData, prizeName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quota</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        value={formData.quota || ''}
                        onChange={(e) => setFormData({ ...formData, quota: parseInt(e.target.value) })}
                      />
                      {editingItem && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Note: Changing initial quota will adjust current quota by the difference.
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className="pt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-bold shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
