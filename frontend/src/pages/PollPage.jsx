import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Users, Clock, Trophy, Share2, AlertCircle } from 'lucide-react'
import useStore from '../store/useStore'
import Countdown from '../components/Countdown'
import LoadingSpinner, { PageLoader } from '../components/LoadingSpinner'
import { ConfirmModal } from '../components/Modal'

export default function PollPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [poll, setPoll] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [stakeAmount, setStakeAmount] = useState('0.001')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { 
    fetchPoll, 
    fetchUserPrediction, 
    submitPrediction, 
    distributeRewards,
    account, 
    connectWallet 
  } = useStore()

  useEffect(() => {
    loadData()
  }, [id, account])

  useEffect(() => {
    if (prediction?.hasPredicted) {
      setSelectedOption(prediction.optionIndex)
    }
  }, [prediction])

  const loadData = async () => {
    const pollData = await fetchPoll(id)
    if (!pollData) {
      toast.error('Poll not found')
      navigate('/')
      return
    }
    setPoll(pollData)

    if (account) {
      const userPred = await fetchUserPrediction(id)
      setPrediction(userPred)
    }
  }

  const handlePredict = async () => {
    if (!account) {
      connectWallet()
      return
    }
    setShowConfirm(true)
  }

  const confirmPrediction = async () => {
    setIsSubmitting(true)
    try {
      await submitPrediction(id, selectedOption, stakeAmount)
      toast.success('Prediction submitted successfully!')
      setShowConfirm(false)
      loadData()
    } catch (error) {
      toast.error(error.message || 'Failed to submit prediction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClaim = async () => {
    setIsSubmitting(true)
    try {
      await distributeRewards(id)
      toast.success('Rewards distributed successfully!')
      loadData()
    } catch (error) {
      toast.error(error.message || 'Failed to distribute rewards')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!poll) return <PageLoader />

  const totalVotes = poll.optionVotes.reduce((a, b) => a + b, 0)
  const isActive = poll.isActive && poll.timeRemaining > 0
  const hasPredicted = prediction?.hasPredicted

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-black">
            <Link to="/" className="hover:underline">HOME</Link>
            <span>/</span>
            <span>POLL #{poll.id}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight">
            {poll.question}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-black shadow-neo rounded-none">
              <Users className="w-4 h-4 text-black" />
              <span className="text-black">{poll.totalPredictions} PREDICTIONS</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-neo-yellow border-2 border-black shadow-neo rounded-none">
              <Trophy className="w-4 h-4 text-black" />
              <span className="text-black">{poll.rewardPool} ETH POOL</span>
            </div>
            {isActive ? (
              <div className="flex items-center space-x-2 px-4 py-2 bg-neo-green border-2 border-black shadow-neo rounded-none">
                <Clock className="w-4 h-4 text-black" />
                <Countdown endTime={poll.endTime} compact />
              </div>
            ) : (
              <div className="px-4 py-2 bg-neo-pink border-2 border-black shadow-neo rounded-none text-black">
                ENDED
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Options Column */}
          <div className="md:col-span-2 space-y-4">
            {poll.options.map((option, idx) => {
              const percentage = totalVotes > 0 
                ? ((poll.optionVotes[idx] / totalVotes) * 100).toFixed(1) 
                : 0
              const isSelected = selectedOption === idx
              const isUserChoice = prediction?.optionIndex === idx
              const isWinner = !isActive && idx === poll.winningOption

              return (
                <button
                  key={idx}
                  onClick={() => isActive && !hasPredicted && setSelectedOption(idx)}
                  disabled={!isActive || hasPredicted}
                  className={`w-full relative overflow-hidden p-4 transition-all border-2 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg active:translate-x-[0px] active:translate-y-[0px] active:shadow-none ${
                    isSelected
                      ? 'bg-neo-blue'
                      : isWinner
                      ? 'bg-neo-green'
                      : 'bg-white hover:bg-gray-50'
                  } ${!isActive || hasPredicted ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {/* Progress Bar */}
                  <div
                    className="absolute inset-0 opacity-20 bg-black"
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="relative flex items-center justify-between z-10">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 border-2 border-black flex items-center justify-center ${
                        isSelected || isUserChoice
                          ? 'bg-black text-white'
                          : 'bg-white'
                      }`}>
                        {(isSelected || isUserChoice) && <div className="w-2 h-2 bg-white" />}
                      </div>
                      <span className="font-bold text-black uppercase text-left">
                        {option}
                      </span>
                      {isWinner && <Trophy className="w-4 h-4 text-black" />}
                      {isUserChoice && <span className="text-xs font-bold text-black bg-white px-1 border border-black">(YOUR CHOICE)</span>}
                    </div>
                    <span className="text-black font-mono font-bold">{percentage}%</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Action Column */}
          <div className="space-y-6">
            <div className="neo-card p-6 space-y-6 bg-white">
              <h3 className="text-xl font-black text-black uppercase">
                {hasPredicted ? 'YOUR PREDICTION' : 'MAKE A PREDICTION'}
              </h3>

              {hasPredicted ? (
                <div className="space-y-4">
                  <div className="p-4 bg-neo-blue border-2 border-black shadow-neo-sm">
                    <p className="text-sm font-bold text-black mb-1">YOU PREDICTED:</p>
                    <p className="text-xl font-black text-black uppercase">
                      {poll.options[prediction.optionIndex]}
                    </p>
                    <p className="text-xs font-bold text-black mt-2">
                      STAKE: {prediction.amount} ETH
                    </p>
                  </div>

                  {!isActive && prediction.optionIndex === poll.winningOption && !prediction.hasClaimedReward && (
                    <button
                      onClick={handleClaim}
                      disabled={isSubmitting}
                      className="w-full neo-button bg-neo-green text-black"
                    >
                      {isSubmitting ? <LoadingSpinner size="sm" /> : 'CLAIM REWARD'}
                    </button>
                  )}

                  {!isActive && prediction.optionIndex === poll.winningOption && prediction.hasClaimedReward && (
                    <div className="p-3 bg-neo-green border-2 border-black text-black font-bold text-center text-sm shadow-neo-sm">
                      REWARD CLAIMED! 🎉
                    </div>
                  )}
                </div>
              ) : isActive ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">Stake Amount (ETH)</label>
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      min="0.001"
                      step="0.001"
                      className="neo-input w-full"
                    />
                  </div>

                  <button
                    onClick={handlePredict}
                    disabled={selectedOption === null || !stakeAmount}
                    className="w-full neo-button bg-neo-yellow text-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {account ? 'SUBMIT PREDICTION' : 'CONNECT WALLET'}
                  </button>
                  
                  <p className="text-xs font-bold text-black text-center">
                    MIN STAKE: 0.001 ETH
                  </p>
                </div>
              ) : (
                <div className="text-center font-bold text-black py-4 border-2 border-black bg-gray-100">
                  THIS POLL HAS ENDED.
                </div>
              )}
            </div>

            {/* Share */}
            <button className="w-full flex items-center justify-center space-x-2 p-3 bg-white border-2 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all text-black font-bold uppercase">
              <Share2 className="w-4 h-4" />
              <span>SHARE POLL</span>
            </button>
          </div>
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmPrediction}
        title="CONFIRM PREDICTION"
        message={`Are you sure you want to predict "${poll.options[selectedOption]}" with ${stakeAmount} ETH stake? This action cannot be undone.`}
        isLoading={isSubmitting}
      />
    </div>
  )
}
