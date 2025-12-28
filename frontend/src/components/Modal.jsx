import { motion } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white border-2 border-black shadow-neo"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black bg-neo-yellow">
          <h3 className="text-lg font-black text-black uppercase">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 border-2 border-black bg-white hover:bg-red-500 hover:text-white transition-colors shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  variant = 'primary',
  isLoading = false,
}) {
  const buttonVariants = {
    primary: 'neo-button bg-neo-green text-black',
    danger: 'neo-button bg-red-500 text-white',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p className="text-black font-bold">{message}</p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 neo-button bg-white text-black"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 ${buttonVariants[variant]} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'PROCESSING...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function ErrorModal({ isOpen, onClose, title = 'ERROR', message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div className="flex items-start space-x-3 p-4 bg-red-100 border-2 border-black shadow-neo-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 font-bold text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full neo-button bg-white text-black"
        >
          CLOSE
        </button>
      </div>
    </Modal>
  )
}
