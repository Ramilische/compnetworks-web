import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css'
import Start from './pages/Start.jsx';
import NetworkDesignForm from './pages/NetworkDesignForm.jsx';

function App() {
	return (
    <Router>
        <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/new-scheme" element={<NetworkDesignForm />} />
        </Routes>
    </Router>
  )
}

export default App
