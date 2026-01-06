import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import useStore from './store/useStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PollPage from './pages/PollPage'
import PollsPage from './pages/PollsPage'
import CreatePollPage from './pages/CreatePollPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import DocsPage from './pages/DocsPage'
import ScrollToTop from './components/ScrollToTop'

function App() {
  const { checkConnection, fetchEthPrice } = useStore()

  useEffect(() => {
    checkConnection()
    fetchEthPrice()
    // Refresh price every 5 minutes
    const interval = setInterval(fetchEthPrice, 300000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/polls" element={<PollsPage />} />
        <Route path="/poll/:id" element={<PollPage />} />
        <Route path="/create" element={<CreatePollPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:address" element={<ProfilePage />} />
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
    </Layout>
  )
}

export default App
