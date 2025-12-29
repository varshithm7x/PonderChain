import { motion } from 'framer-motion'
import { Book, Code, Shield, Zap, HelpCircle, Award } from 'lucide-react'

export default function DocsPage() {
  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: Book,
      content: (
        <div className="space-y-4">
          <p className="text-lg font-bold">
            Welcome to PonderChain, the decentralized predictive polling platform built on the Lisk blockchain.
          </p>
          <p>
            PonderChain allows users to create polls, predict outcomes, and earn rewards based on the accuracy of their predictions. 
            It leverages the transparency and security of blockchain technology to ensure fair play and immutable results.
          </p>
        </div>
      )
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Zap,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-black uppercase">1. Connect Your Wallet</h3>
          <p>
            To interact with PonderChain, you need a Web3 wallet like MetaMask. Click the "Connect Wallet" button in the top right corner.
          </p>
          <div className="p-4 bg-white border-2 border-black shadow-neo-sm space-y-2">
            <p className="text-sm font-black uppercase border-b-2 border-black pb-1">Network Details</p>
            <ul className="text-xs font-mono space-y-1">
              <li><strong>Network Name:</strong> Lisk Sepolia</li>
              <li><strong>RPC URL:</strong> https://rpc.sepolia-api.lisk.com</li>
              <li><strong>Chain ID:</strong> 4202</li>
              <li><strong>Currency Symbol:</strong> ETH</li>
              <li><strong>Explorer:</strong> https://sepolia-blockscout.lisk.com</li>
            </ul>
            <p className="text-[10px] font-bold pt-2">
              For more help, visit the <a href="https://docs.lisk.com/user/connecting-to-a-wallet/#lisk-sepolia-testnet" target="_blank" rel="noopener noreferrer" className="text-neo-blue hover:underline">Official Lisk Wallet Guide</a>.
            </p>
          </div>
          
          <h3 className="text-xl font-black uppercase mt-6">2. Get Test Tokens</h3>
          <p>
            You will need <strong>ETH</strong> tokens on the Lisk Sepolia network to pay for gas fees and to stake on predictions.
          </p>
          <p>
            You can get free testnet ETH from the following faucets:
          </p>
          <ul className="list-disc list-inside space-y-2 font-bold">
            <li>
              <a href="https://console.optimism.io/faucet" target="_blank" rel="noopener noreferrer" className="text-neo-blue hover:underline">
                Optimism Superchain Faucet (Recommended)
              </a>
            </li>
            <li>
              <a href="https://docs.lisk.com/lisk-tools/faucets/" target="_blank" rel="noopener noreferrer" className="text-neo-blue hover:underline">
                Lisk Faucets Directory
              </a>
            </li>
          </ul>
          <p className="text-sm italic">
            Simply paste your wallet address into the faucet, select <strong>Lisk Sepolia</strong>, and request tokens.
          </p>
        </div>
      )
    },
    {
      id: 'creating-polls',
      title: 'Creating Polls',
      icon: Code,
      content: (
        <div className="space-y-4">
          <p>
            Anyone can create a poll on PonderChain. Here is how:
          </p>
          <ul className="list-disc list-inside space-y-2 font-bold">
            <li>Navigate to the "Create Poll" page.</li>
            <li>Enter a clear and concise question.</li>
            <li>Add at least two options for users to choose from.</li>
            <li>Set the duration for the poll (between 1 hour and 30 days).</li>
            <li>Fund the initial reward pool (minimum amount required).</li>
          </ul>
          <div className="p-4 bg-neo-yellow border-2 border-black shadow-neo-sm mt-4">
            <p className="text-sm font-bold">
              NOTE: A small platform fee (2%) is deducted from the initial reward pool to support the ecosystem.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'predicting',
      title: 'Making Predictions',
      icon: HelpCircle,
      content: (
        <div className="space-y-4">
          <p>
            Participate in polls by predicting the outcome:
          </p>
          <ul className="list-disc list-inside space-y-2 font-bold">
            <li>Browse active polls on the Home page.</li>
            <li>Select a poll that interests you.</li>
            <li>Choose the option you think will win (or is the most popular).</li>
            <li>Enter your stake amount (ETH).</li>
            <li>Confirm the transaction in your wallet.</li>
          </ul>
          <p className="mt-4">
            Your stake is added to the total reward pool. If your prediction is correct, you win a share of the pool!
          </p>
        </div>
      )
    },
    {
      id: 'rewards',
      title: 'Rewards & Distribution',
      icon: Award,
      content: (
        <div className="space-y-4">
          <p>
            When a poll ends, the option with the most votes is declared the winner.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-white border-2 border-black shadow-neo-sm">
              <h4 className="font-black uppercase mb-2">Winners</h4>
              <p className="text-sm">
                Users who voted for the winning option split the entire reward pool proportionally to their stake.
              </p>
            </div>
            <div className="p-4 bg-white border-2 border-black shadow-neo-sm">
              <h4 className="font-black uppercase mb-2">Losers</h4>
              <p className="text-sm">
                Users who voted for other options lose their stake, which goes to the winners.
              </p>
            </div>
          </div>
          <p className="mt-4 font-bold">
            Rewards must be manually claimed or distributed after the poll is finalized.
          </p>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security & Contracts',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p>
            PonderChain runs on smart contracts verified on the Lisk blockchain.
          </p>
          <p>
            The code is open-source and transparent. We use standard security practices like ReentrancyGuard to protect user funds.
          </p>
          <a 
            href="https://sepolia-blockscout.lisk.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mt-2 text-neo-blue hover:underline font-bold"
          >
            View Contract on Explorer &rarr;
          </a>
        </div>
      )
    }
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        {/* Header */}
        <div className="text-center space-y-4 bg-white border-2 border-black shadow-neo p-8 md:p-12">
          <h1 className="text-5xl md:text-7xl font-black text-black uppercase tracking-tighter">
            Documentation
          </h1>
          <p className="text-xl font-bold text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about using PonderChain.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar Navigation (Desktop) */}
          <div className="hidden md:block md:col-span-3 sticky top-24 h-fit">
            <div className="bg-white border-2 border-black shadow-neo p-4 space-y-2">
              <p className="text-xs font-black text-gray-500 uppercase mb-4 px-3">Contents</p>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block p-3 border-2 border-transparent hover:border-black hover:bg-neo-yellow transition-all font-bold text-sm uppercase"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-9 space-y-12">
            {sections.map((section, index) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="scroll-mt-24"
              >
                <div className="neo-card p-8 bg-white">
                  <div className="flex items-center space-x-4 mb-6 pb-4 border-b-2 border-black">
                    <div className="p-3 bg-black text-white">
                      <section.icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black uppercase">{section.title}</h2>
                  </div>
                  <div className="prose prose-lg max-w-none font-medium">
                    {section.content}
                  </div>
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
