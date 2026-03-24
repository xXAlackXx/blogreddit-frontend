import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ParticleCanvas from './components/ParticleCanvas'
import Footer from './components/Footer'
import Home from './pages/Home'
import AuthPage from './pages/AuthPage'
import CreatePost from './pages/CreatePost'
import PostDetail from './pages/PostDetail'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'

const queryClient = new QueryClient()

function AppLayout() {
  return (
    <>
      <ParticleCanvas />
      <div style={{ position:'relative', zIndex:1, minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <Navbar />
        <div style={{ flex:1 }}>
          <Outlet />
        </div>
        <Footer />
      </div>
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth routes — full screen, no navbar */}
            <Route path="/login" element={<AuthPage initialTab="login" />} />
            <Route path="/register" element={<AuthPage initialTab="register" />} />
            {/* App routes — with navbar + footer */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/u/:username" element={<PublicProfile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
