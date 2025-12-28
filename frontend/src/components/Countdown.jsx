import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function Countdown({ endTime, compact = false, onEnd = () => {} }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = endTime - Date.now()
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)
      
      if (newTimeLeft.total <= 0) {
        clearInterval(timer)
        onEnd()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime, onEnd])

  if (timeLeft.total <= 0) {
    return (
      <div className="flex items-center space-x-1 text-red-600 font-bold">
        <Clock className="w-4 h-4" />
        <span className="text-sm uppercase">Ended</span>
      </div>
    )
  }

  if (compact) {
    if (timeLeft.days > 0) {
      return (
        <p className="text-sm font-bold text-black font-mono">
          {timeLeft.days}d {timeLeft.hours}h
        </p>
      )
    }
    return (
      <p className="text-sm font-bold text-black font-mono">
        {timeLeft.hours.toString().padStart(2, '0')}:
        {timeLeft.minutes.toString().padStart(2, '0')}:
        {timeLeft.seconds.toString().padStart(2, '0')}
      </p>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {timeLeft.days > 0 && (
        <div className="text-center">
          <div className="bg-white border-2 border-black shadow-neo-sm px-4 py-2 min-w-[60px]">
            <span className="text-2xl font-black text-black font-mono">{timeLeft.days}</span>
          </div>
          <span className="text-xs font-bold text-black mt-1 uppercase">Days</span>
        </div>
      )}
      <div className="text-center">
        <div className="bg-white border-2 border-black shadow-neo-sm px-4 py-2 min-w-[60px]">
          <span className="text-2xl font-black text-black font-mono">
            {timeLeft.hours.toString().padStart(2, '0')}
          </span>
        </div>
        <span className="text-xs font-bold text-black mt-1 uppercase">Hours</span>
      </div>
      <div className="text-center">
        <div className="bg-white border-2 border-black shadow-neo-sm px-4 py-2 min-w-[60px]">
          <span className="text-2xl font-black text-black font-mono">
            {timeLeft.minutes.toString().padStart(2, '0')}
          </span>
        </div>
        <span className="text-xs font-bold text-black mt-1 uppercase">Mins</span>
      </div>
      <div className="text-center">
        <div className="bg-white border-2 border-black shadow-neo-sm px-4 py-2 min-w-[60px]">
          <span className="text-2xl font-black text-black font-mono animate-pulse">
            {timeLeft.seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <span className="text-xs font-bold text-black mt-1 uppercase">Secs</span>
      </div>
    </div>
  )
}
