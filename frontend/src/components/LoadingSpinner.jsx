import { motion } from 'framer-motion'

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        className={`${sizes[size]} border-4 border-black border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p className="text-black font-bold text-sm uppercase animate-pulse">{text}</p>
      )}
    </div>
  )
}

export function PageLoader({ text = 'LOADING...' }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="neo-card p-6 animate-pulse bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-16 bg-gray-200 border-2 border-black" />
        <div className="h-5 w-10 bg-gray-200 border-2 border-black" />
      </div>
      <div className="h-6 w-3/4 bg-gray-200 border-2 border-black mb-2" />
      <div className="h-6 w-1/2 bg-gray-200 border-2 border-black mb-4" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-gray-200 border-2 border-black" />
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-black">
        <div className="h-8 w-24 bg-gray-200 border-2 border-black" />
        <div className="h-8 w-20 bg-gray-200 border-2 border-black" />
      </div>
    </div>
  )
}
