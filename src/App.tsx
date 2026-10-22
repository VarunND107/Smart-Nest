import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { GuestOnly, RequireAuth } from './components/guards'
import Layout from './components/Layout'
import { PageLoading } from './components/ui'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import { ForgotPassword, Login, ResetPassword, Signup } from './pages/auth'

// The guide library (markdown + renderer) is the heaviest code; load it only when someone opens /learn.
const LearnHome = lazy(() => import('./learn/Learn').then((m) => ({ default: m.LearnHome })))
const LearnCategory = lazy(() => import('./learn/Learn').then((m) => ({ default: m.LearnCategory })))
const GuideArticle = lazy(() => import('./learn/Learn').then((m) => ({ default: m.GuideArticle })))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Status = lazy(() => import('./pages/Status'))

export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="learn" element={<LearnHome />} />
          <Route path="learn/c/:category" element={<LearnCategory />} />
          <Route path="learn/:slug" element={<GuideArticle />} />
          <Route path="status" element={<Status />} />

          <Route element={<GuestOnly />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route path="reset-password" element={<ResetPassword />} />

          <Route element={<RequireAuth />}>
            <Route path="dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
