import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, Wallet, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import useStore from '../store/useStore'
import { NETWORKS } from '../config'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false)
  const location = useLocation()
  
  const { account, chainId, isConnecting, isSwitchingNetwork, connectWallet, disconnectWallet, switchNetwork } = useStore()

  const handleDisconnect = async () => {
    await disconnectWallet()
    toast.success('Wallet disconnected')
  }

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/create', label: 'Create Poll' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/profile', label: 'Profile' },
  ]

  const currentNetwork = Object.values(NETWORKS).find(n => n.chainId === chainId)

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neo-white border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-neo-black flex items-center justify-center border-2 border-black shadow-neo-sm group-hover:shadow-neo transition-all">
              <img src="/veto.webp" alt="VETO" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-2xl font-black text-black tracking-tighter uppercase">VETO</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-6 py-2 text-sm font-bold border-2 border-black transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'bg-neo-yellow shadow-neo-sm'
                    : 'bg-white hover:bg-gray-100 hover:shadow-neo-sm'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {account ? (
              <>
                {/* Network Selector */}
                <div className="relative">
                  <button
                    onClick={() => !isSwitchingNetwork && setShowNetworkDropdown(!showNetworkDropdown)}
                    disabled={isSwitchingNetwork}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-black shadow-neo-sm hover:shadow-neo transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSwitchingNetwork ? (
                      <>
                        <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-bold">Switching...</span>
                      </>
                    ) : (
                      <>
                        <div className={`w-3 h-3 border-2 border-black ${currentNetwork ? 'bg-neo-green' : 'bg-neo-pink'}`} />
                        <span className="text-sm font-bold">{currentNetwork?.name || 'Unknown'}</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {showNetworkDropdown && !isSwitchingNetwork && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-56 py-2 bg-white border-2 border-black shadow-neo"
                    >
                      {Object.values(NETWORKS).map((network) => (
                        <button
                          key={network.chainId}
                          onClick={() => {
                            switchNetwork(network.chainId)
                            setShowNetworkDropdown(false)
                          }}
                          className={`w-full px-4 py-3 text-left text-sm font-bold hover:bg-neo-yellow border-b-2 border-black last:border-0 transition-colors ${
                            chainId === network.chainId ? 'bg-neo-yellow' : ''
                          }`}
                        >
                          {network.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Account Display */}
                <div className="flex items-center space-x-2 px-4 py-2 bg-neo-blue border-2 border-black shadow-neo-sm">
                  <div className="w-3 h-3 bg-neo-green border-2 border-black animate-pulse" />
                  <span className="text-sm font-mono font-bold text-white">{formatAddress(account)}</span>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={handleDisconnect}
                  className="p-2 bg-neo-pink border-2 border-black shadow-neo-sm hover:shadow-neo transition-all text-black"
                  title="Disconnect"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="neo-button flex items-center space-x-2 bg-neo-green"
              >
                <Wallet className="w-5 h-5" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 border-2 border-black bg-white shadow-neo-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t-2 border-black bg-white"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-sm font-bold border-2 border-black transition-all ${
                  location.pathname === link.path
                    ? 'bg-neo-yellow shadow-neo-sm'
                    : 'bg-white hover:bg-gray-100 hover:shadow-neo-sm'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t-2 border-black space-y-3">
              {account ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-4 py-3 bg-neo-blue border-2 border-black shadow-neo-sm">
                    <span className="text-sm font-bold text-white">Connected</span>
                    <span className="text-sm font-mono font-bold text-white">{formatAddress(account)}</span>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="w-full px-4 py-3 bg-neo-pink border-2 border-black shadow-neo-sm hover:shadow-neo transition-all text-sm font-bold text-black"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full neo-button flex items-center justify-center space-x-2 bg-neo-green"
                >
                  <Wallet className="w-5 h-5" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
