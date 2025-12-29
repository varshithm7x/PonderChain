import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award } from 'lucide-react'
import useStore from '../store/useStore'
import { PageLoader } from '../components/LoadingSpinner'

export default function LeaderboardPage() {
  const { leaderboard, fetchLeaderboard, isLoading } = useStore()

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  if (isLoading && leaderboard.length === 0) return <PageLoader />

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-black" />
      case 2: return <Medal className="w-6 h-6 text-gray-500" />
      case 3: return <Medal className="w-6 h-6 text-orange-600" />
      default: return <span className="text-black font-mono font-bold">#{rank}</span>
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight">Leaderboard</h1>
          <p className="text-black font-bold">
            TOP PREDICTORS EARNING THE MOST REWARDS.
          </p>
        </div>

        <div className="border-2 border-black shadow-neo bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black bg-neo-yellow">
                  <th className="px-6 py-4 text-left text-sm font-black text-black uppercase">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-black uppercase">User</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-black uppercase">Correct Predictions</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-black uppercase">Total Rewards</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-black uppercase">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {leaderboard.map((entry, index) => (
                  <tr 
                    key={entry.address}
                    className="hover:bg-neo-blue/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center justify-center w-10 h-10 border-2 border-black ${
                        index === 0 ? 'bg-neo-yellow' : index === 1 ? 'bg-gray-200' : index === 2 ? 'bg-orange-200' : 'bg-white'
                      }`}>
                        {getRankIcon(index + 1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 border-2 border-black bg-neo-pink flex items-center justify-center text-xs font-bold text-black">
                          {entry.address.slice(2, 4)}
                        </div>
                        <span className="font-mono text-sm font-bold text-black">
                          {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-black">
                      {entry.correctPredictions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-black text-black">
                      {parseFloat(entry.totalRewards).toFixed(5)} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center space-x-1 px-2 py-1 border-2 border-black bg-neo-green text-black text-xs font-bold shadow-neo-sm">
                        <span>🔥</span>
                        <span>{entry.streak}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
