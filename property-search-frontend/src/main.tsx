import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import './index.css'
import SearchPage from './pages/SearchPage'
import DetailPage from './pages/DetailPage'
import AddPropertyPage from './pages/AddPropertyPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-6">
          <h1 className="text-2xl font-bold">Property Search</h1>
          <nav className="flex gap-4">
            <NavLink to="/" className="hover:underline">Search</NavLink>
            <NavLink to="/add" className="hover:underline">Add Property</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/property/:id" element={<DetailPage />} />
          <Route path="/add" element={<AddPropertyPage />} />
        </Routes>
      </main>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>
)
