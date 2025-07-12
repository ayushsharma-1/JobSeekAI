import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import "./index.css"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* Add more routes here as needed, e.g.:
        <Route path="/about" element={<About />} />
        <Route path="/settings" element={<Settings />} />
        */}
      </Routes>
    </Router>
  )
}

export default App