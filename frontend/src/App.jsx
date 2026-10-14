import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css'
import Start from './pages/Start.jsx';
import NetworkDesignForm from './pages/NetworkDesignForm.jsx';
import ChooseScheme from './pages/ChooseScheme.jsx';
import EditScheme from './pages/EditScheme.jsx';

function App() {
	return (
    <Router>
        <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/new-scheme" element={<NetworkDesignForm />} />
            <Route path="/choose-scheme" element={<ChooseScheme />} />
            <Route path="/edit-scheme/:schemeName" element={<EditScheme />} />
        </Routes>
    </Router>
  )
}

export default App
