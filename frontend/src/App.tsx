import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

import Home from './pages/Home'
import Library from './pages/Library'
import MangaDetail from './pages/MangaDetail'
import Reader from './pages/Reader'
import Profile from './pages/Profile'
import MyLibrary from './pages/MyLibrary'
import Bookmarks from './pages/Bookmarks'
import Downloads from './pages/Downloads'
import Search from './pages/Search'
import Subscribe from './pages/Subscribe'
import EditProfile from './pages/EditProfile'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#11111a',
                color: '#fff',
                border: '1px solid #23232f',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#d946ef', secondary: '#07070d' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#07070d' },
              },
              duration: 3000,
            }}
          />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/"                   element={<Home />} />
              <Route path="/library"            element={<Library />} />
              <Route path="/manga/:id"          element={<MangaDetail />} />
              <Route path="/read/:chapterId"    element={<Reader />} />
              <Route path="/profile/:username"  element={<Profile />} />
              <Route path="/search"             element={<Search />} />
              <Route path="/subscribe"          element={<Subscribe />} />
              <Route path="/login"              element={<Login />} />
              <Route path="/register"           element={<Register />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/my-library"       element={<MyLibrary />} />
                <Route path="/bookmarks"        element={<Bookmarks />} />
                <Route path="/downloads"        element={<Downloads />} />
                <Route path="/settings/profile" element={<EditProfile />} />
                <Route path="/settings"         element={<Navigate to="/settings/profile" replace />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
