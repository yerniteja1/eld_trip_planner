import { useState } from 'react'
import TripForm from './components/TripForm'

function App() {
  const [result, setResult] = useState(null)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🚛 ELD Trip Planner
      </h1>

      <TripForm onResult={setResult} />

      {result && (
        <div style={{ marginTop: '30px' }}>
          <h2>Trip Summary</h2>
          <pre style={{
            background: '#fff',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '13px',
            overflow: 'auto'
          }}>
            {JSON.stringify(result.summary, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default App