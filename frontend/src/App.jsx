import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/page_blocks/header.jsx'

import Start from './pages/Start.jsx'
import GetNodes from './pages/GetNodes.jsx'
import GetCables from './pages/GetCables.jsx'

import './App.css'

function App() {
	return (
    <>
	<Header></Header>
	<Router>
        <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/init-nodes" element={<GetNodes />} />
			<Route path="/init-cables" element={<GetCables />} />
        </Routes>
    </Router>
    </>
  )
}

export default App
