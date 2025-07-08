import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import ErrorBoundary from './components/ui/ErrorBoundary'
import ToastContainer from './components/ui/Toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import KYC from './pages/KYC'
import NotaryUpload from './pages/NotaryUpload'
import Settlements from './pages/Settlements'
import Profile from './pages/Profile'

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/kyc" element={<KYC />} />
            <Route path="/notary" element={<NotaryUpload />} />
            <Route path="/settlements" element={<Settlements />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </motion.div>
      </Layout>
      <ToastContainer />
    </ErrorBoundary>
  )
}

export default App