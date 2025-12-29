import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Users, Trophy, ArrowRight, CheckCircle } from 'lucide-react'
import Countdown from './Countdown'

export default function PollCard({ poll, index = 0 }) {
  const isActive = poll.isActive && poll.timeRemaining > 0
  const totalVotes = poll.optionVotes.reduce((a, b) => a + b, 0)

  const getMaxVotedOption = () => {
    if (totalVotes === 0) return null
    const maxVotes = Math.max(...poll.optionVotes)
    const maxIndex = poll.optionVotes.indexOf(maxVotes)
    return { index: maxIndex, votes: maxVotes, option: poll.options[maxIndex] }
  }

  const maxVoted = getMaxVotedOption()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="neo-card p-6 group hover:-translate-y-1 hover:shadow-neo-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {isActive ? (
            <span className="px-2 py-1 bg-neo-green border-2 border-black shadow-neo-sm text-xs font-bold flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span>LIVE</span>
            </span>
          ) : poll.rewardsDistributed ? (
            <span className="px-2 py-1 bg-neo-blue text-white border-2 border-black shadow-neo-sm text-xs font-bold flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>DONE</span>
            </span>
          ) : (
            <span className="px-2 py-1 bg-neo-yellow border-2 border-black shadow-neo-sm text-xs font-bold">ENDED</span>
          )}
        </div>
        <div className="flex items-center space-x-1 text-black font-bold text-sm">
          <Users className="w-4 h-4" />
          <span>{poll.totalPredictions}</span>
        </div>
      </div>

      {/* Question */}
      <h3 className="text-xl font-black text-black mb-4 line-clamp-2 group-hover:text-neo-purple transition-colors uppercase">
        {poll.question}
      </h3>

      {/* Options Preview */}
      <div className="space-y-3 mb-6">
        {poll.options.slice(0, 3).map((option, idx) => {
          const percentage = totalVotes > 0 
            ? ((poll.optionVotes[idx] / totalVotes) * 100).toFixed(0) 
            : 0
          const isWinner = !isActive && idx === poll.winningOption
          const showResults = !isActive

          return (
            <div
              key={idx}
              className={`relative overflow-hidden p-3 border-2 border-black ${
                isWinner 
                  ? 'bg-neo-green' 
                  : 'bg-white'
              }`}
            >
              {/* Progress bar */}
              {showResults && (
                <div
                  className={`absolute inset-y-0 left-0 border-r-2 border-black ${
                    isWinner ? 'bg-green-400' : 'bg-neo-yellow'
                  }`}
                  style={{ width: `${percentage}%`, opacity: 0.5 }}
                />
              )}
              <div className="relative flex items-center justify-between z-10">
                <span className={`text-sm font-bold text-black`}>
                  {option}
                </span>
                {showResults && (
                  <span className="text-xs font-black text-black">{percentage}%</span>
                )}
              </div>
            </div>
          )
        })}
        {poll.options.length > 3 && (
          <p className="text-xs font-bold text-gray-500 text-center">
            +{poll.options.length - 3} more options
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between py-4 border-t-2 border-black">
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Pool</p>
            <p className="text-sm font-black text-neo-purple">
              {parseFloat(poll.rewardPool).toFixed(5)} ETH
            </p>
          </div>
          {isActive && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Ends In</p>
              <Countdown endTime={poll.endTime} />
            </div>
          )}
        </div>
      </div>

      <Link 
        to={`/poll/${poll.id}`}
        className="w-full neo-button flex items-center justify-center space-x-2 group-hover:bg-neo-pink group-hover:text-white"
      >
        <span>{isActive ? 'Predict Now' : 'View Results'}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  )
}
