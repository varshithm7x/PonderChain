import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, Users, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import useStore from '../store/useStore'
import PollCard from '../components/PollCard'
import { CardSkeleton } from '../components/LoadingSpinner'

export default function HomePage() {
  const { activePolls, closedPolls, fetchActivePolls, fetchClosedPolls, isLoading } = useStore()

  useEffect(() => {
    fetchActivePolls()
    fetchClosedPolls()
  }, [])

  const stats = [
    { label: 'Total Polls', value: activePolls.length + closedPolls.length, icon: TrendingUp, color: 'bg-neo-yellow' },
    { label: 'Active Users', value: '1.2k+', icon: Users, color: 'bg-neo-pink' },
    { label: 'Rewards Paid', value: '45.5 ETH', icon: Award, color: 'bg-neo-green' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Section */}
      <section className="relative text-center space-y-8 py-12">
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-black"
        >
          PREDICT THE <span className="bg-neo-yellow px-2 border-2 border-black shadow-neo-sm">FUTURE</span>
          <br />
          WIN <span className="bg-neo-green px-2 border-2 border-black shadow-neo-sm">REWARDS</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl font-bold text-black max-w-3xl mx-auto border-2 border-black bg-white p-6 shadow-neo"
        >
          Join the ultimate decentralized prediction game on Lisk. 
          Vote on trending topics, beat the crowd, and earn crypto rewards.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center space-x-6"
        >
          <Link to="/create" className="neo-button bg-neo-pink text-xl flex items-center space-x-2">
            <span>Create Poll</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
          <Link to="/leaderboard" className="neo-button bg-white hover:bg-gray-100">
            View Leaderboard
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="neo-card p-6 flex items-center space-x-4 hover:-translate-y-1 hover:shadow-neo-lg transition-all">
              <div className={`p-4 border-2 border-black shadow-neo-sm ${stat.color}`}>
                <stat.icon className="w-8 h-8 text-black" />
              </div>
              <div className="text-left">
                <p className="text-3xl font-black text-black">{stat.value}</p>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Active Polls */}
      <section>
        <div className="flex items-center justify-between mb-8 bg-neo-blue p-4 border-2 border-black shadow-neo">
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">Trending Polls</h2>
          <Link to="/polls" className="px-4 py-2 bg-white border-2 border-black shadow-neo-sm font-bold hover:bg-neo-yellow transition-colors">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3].map((i) => <CardSkeleton key={i} />)
          ) : activePolls.length > 0 ? (
            activePolls.map((poll, index) => (
              <PollCard key={poll.id} poll={poll} index={index} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white border-2 border-black shadow-neo">
              <p className="text-xl font-bold">No active polls found. Be the first to create one!</p>
              <Link to="/create" className="text-neo-blue hover:underline mt-2 inline-block font-bold">
                Create a Poll
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Closed Polls */}
      {closedPolls.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8 bg-neo-pink p-4 border-2 border-black shadow-neo">
            <h2 className="text-3xl font-black text-black uppercase tracking-wider">Recent Results</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {closedPolls.map((poll, index) => (
              <PollCard key={poll.id} poll={poll} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="py-12 border-t-4 border-black">
        <h2 className="text-4xl font-black text-black text-center mb-12 uppercase">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: '1. Choose a Poll',
              desc: 'Browse active polls on trending topics like crypto, sports, and tech.',
              icon: '🔍',
              color: 'bg-neo-yellow'
            },
            {
              title: '2. Make a Prediction',
              desc: 'Stake ETH and predict the majority choice. The more you stake, the more you can win.',
              icon: '🎯',
              color: 'bg-neo-pink'
            },
            {
              title: '3. Earn Rewards',
              desc: 'If your prediction matches the majority, you win a share of the reward pool!',
              icon: '💰',
              color: 'bg-neo-green'
            },
          ].map((step, index) => (
            <div key={index} className="text-center space-y-4 neo-card p-8 hover:-translate-y-2 transition-transform">
              <div className={`w-20 h-20 mx-auto flex items-center justify-center text-4xl border-2 border-black shadow-neo-sm ${step.color}`}>
                {step.icon}
              </div>
              <h3 className="text-2xl font-black text-black uppercase">{step.title}</h3>
              <p className="text-gray-800 font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
