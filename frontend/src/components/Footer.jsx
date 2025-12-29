import { Link } from 'react-router-dom'
import { Github, Twitter, MessageCircle, ExternalLink } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Github, href: 'https://github.com/ponderchain', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com/ponderchain', label: 'Twitter' },
    { icon: MessageCircle, href: 'https://discord.gg/ponderchain', label: 'Discord' },
  ]

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Create Poll', href: '/create' },
        { label: 'Leaderboard', href: '/leaderboard' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/docs' },
        { label: 'Smart Contract', href: 'https://sepolia-blockscout.lisk.com', external: true },
        { label: 'Lisk Network', href: 'https://lisk.com', external: true },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', href: '#' },
        { label: 'Privacy Policy', href: '#' },
      ],
    },
  ]

  return (
    <footer className="border-t-2 border-black mt-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 border-2 border-black bg-neo-yellow flex items-center justify-center shadow-neo-sm">
                <span className="text-black font-black text-xl">P</span>
              </div>
              <span className="text-xl font-black text-black uppercase">PonderChain</span>
            </Link>
            <p className="text-black font-bold text-sm mb-4 max-w-xs">
              A DECENTRALIZED PREDICTIVE POLLING GAME ON LISK BLOCKCHAIN. PREDICT THE MAJORITY, EARN REWARDS.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border-2 border-black bg-white hover:bg-neo-blue text-black transition-all shadow-neo-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo"
                  title={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-black font-black uppercase mb-4">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black font-bold hover:underline text-sm flex items-center space-x-1 transition-colors"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-black font-bold hover:underline text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t-2 border-black flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-black font-bold text-sm">
            © {currentYear} PONDERCHAIN. BUILT ON LISK.
          </p>
          <div className="flex items-center space-x-2 text-black font-bold text-sm">
            <span>POWERED BY</span>
            <a
              href="https://lisk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:underline font-black uppercase"
            >
              Lisk
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
