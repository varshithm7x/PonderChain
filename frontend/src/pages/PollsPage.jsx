import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import PollCard from '../components/PollCard'
import { CardSkeleton } from '../components/LoadingSpinner'

export default function PollsPage() {
  const { activePolls, closedPolls, fetchActivePolls, fetchClosedPolls, isLoading } = useStore()
  const [filter, setFilter] = useState('all') // 'all', 'active', 'closed'

  useEffect(() => {
    fetchActivePolls()
    fetchClosedPolls()
  }, [])

  const allPolls = [...activePolls, ...closedPolls].sort((a, b) => b.id - a.id)
  
  const filteredPolls = allPolls.filter(poll => {
    if (filter === 'active') return poll.isActive && poll.timeRemaining > 0
    if (filter === 'closed') return !poll.isActive || poll.timeRemaining <= 0
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl font-black text-black uppercase">All Polls</h1>
        
        <div className="flex space-x-2">
          {['all', 'active', 'closed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 font-bold border-2 border-black shadow-neo-sm transition-all uppercase ${
                filter === f 
                  ? 'bg-neo-yellow translate-x-[1px] translate-y-[1px] shadow-none' 
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)
        ) : filteredPolls.length > 0 ? (
          filteredPolls.map((poll, index) => (
            <PollCard key={poll.id} poll={poll} index={index} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white border-2 border-black shadow-neo">
            <p className="text-xl font-bold">No polls found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
