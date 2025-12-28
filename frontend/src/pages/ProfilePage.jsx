import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Award, Target, Zap } from 'lucide-react'
import useStore from '../store/useStore'
import { PageLoader } from '../components/LoadingSpinner'

export default function ProfilePage() {
  const { address } = useParams()
  const { account, userStats, fetchUserStats, connectWallet } = useStore()
  
  const targetAddress = address || account

  useEffect(() => {
    if (targetAddress) {
      fetchUserStats(targetAddress)
    }
  }, [targetAddress])

  if (!targetAddress) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-black font-bold uppercase">Connect your wallet to view your profile</p>
        <button onClick={connectWallet} className="neo-button bg-neo-yellow text-black">
          CONNECT WALLET
        </button>
      </div>
    )
  }

  if (!userStats) return <PageLoader />

  const stats = [
    { label: 'TOTAL PREDICTIONS', value: userStats.totalPredictions, icon: Target, color: 'text-black', bg: 'bg-neo-blue' },
    { label: 'CORRECT PREDICTIONS', value: userStats.correctPredictions, icon: Award, color: 'text-black', bg: 'bg-neo-green' },
    { label: 'ACCURACY', value: `${userStats.accuracy}%`, icon: Zap, color: 'text-black', bg: 'bg-neo-yellow' },
    { label: 'TOTAL EARNED', value: `${parseFloat(userStats.totalRewardsEarned).toFixed(4)} ETH`, icon: User, color: 'text-black', bg: 'bg-neo-pink' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8 p-6 border-2 border-black shadow-neo bg-white">
          <div className="w-20 h-20 border-2 border-black bg-neo-yellow flex items-center justify-center text-3xl font-black text-black">
            {targetAddress.slice(2, 4)}
          </div>
          <div>
            <h1 className="text-3xl font-black text-black uppercase">USER PROFILE</h1>
            <p className="text-black font-mono font-bold">{targetAddress}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="border-2 border-black shadow-neo bg-white p-6 flex items-center space-x-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all">
              <div className={`p-3 border-2 border-black ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-black">{stat.label}</p>
                <p className="text-xl font-black text-black">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Streak Info */}
        <div className="border-2 border-black shadow-neo p-8 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-black uppercase mb-1">CURRENT STREAK</h3>
              <p className="text-4xl font-black text-black">{userStats.currentStreak} 🔥</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-black text-black uppercase mb-1">LONGEST STREAK</h3>
              <p className="text-4xl font-black text-black">{userStats.longestStreak} 🏆</p>
            </div>
          </div>
        </div>

        {/* Badges Section (Placeholder) */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-black uppercase">BADGES</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-2 border-black bg-gray-100 p-4 text-center space-y-2 opacity-50 grayscale">
                <div className="w-12 h-12 mx-auto rounded-full border-2 border-black bg-white flex items-center justify-center">
                  🔒
                </div>
                <p className="text-sm font-bold text-black uppercase">LOCKED</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
