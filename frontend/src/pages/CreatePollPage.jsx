import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'

export default function CreatePollPage() {
  const navigate = useNavigate()
  const { createPoll, account, connectWallet } = useStore()
  
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [duration, setDuration] = useState('24') // hours
  const [rewardPool, setRewardPool] = useState('0.001')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ''])
    }
  }

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!account) {
      connectWallet()
      return
    }

    if (!question.trim()) {
      toast.error('Please enter a question')
      return
    }

    if (options.some(opt => !opt.trim())) {
      toast.error('Please fill all options')
      return
    }

    setIsSubmitting(true)
    try {
      const durationInSeconds = Number(duration) * 3600
      const pollId = await createPoll(question, options, durationInSeconds, rewardPool)
      
      if (pollId) {
        toast.success('Poll created successfully!')
        navigate(`/poll/${pollId}`)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create poll')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-black uppercase">Create a Poll</h1>
          <p className="text-xl font-bold text-gray-600">
            Ask the community and reward the winners.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="neo-card p-8 space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <label className="block text-sm font-black text-black uppercase">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Who will win the 2024 election?"
              className="neo-input"
              maxLength={100}
            />
            <p className="text-xs font-bold text-gray-500 text-right">
              {question.length}/100
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-black uppercase">
              Options
            </label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="neo-input"
                  maxLength={50}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="p-3 bg-neo-pink border-2 border-black shadow-neo-sm hover:shadow-neo transition-all text-black"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            
            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="w-full py-3 border-2 border-dashed border-black text-black font-bold hover:bg-neo-yellow transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Option</span>
              </button>
            )}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-black text-black uppercase">
                Duration (Hours)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="neo-input"
              >
                <option value="1">1 Hour</option>
                <option value="24">24 Hours</option>
                <option value="48">48 Hours</option>
                <option value="168">7 Days</option>
                <option value="720">30 Days</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-black uppercase">
                Initial Reward Pool (ETH)
              </label>
              <input
                type="number"
                value={rewardPool}
                onChange={(e) => setRewardPool(e.target.value)}
                min="0.001"
                step="0.001"
                className="neo-input"
              />
            </div>
          </div>

          {/* Fee Notice */}
          <div className="bg-neo-blue p-4 border-2 border-black shadow-neo-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
            <div className="text-sm font-bold text-white">
              <p>A 2% platform fee will be deducted from the reward pool.</p>
              <p className="mt-1 opacity-75">
                You will need to approve the transaction in your wallet.
              </p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full neo-button bg-neo-green text-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Creating Poll...</span>
              </>
            ) : (
              <span>Create Poll</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
