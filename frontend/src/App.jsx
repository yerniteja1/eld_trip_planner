import { useState } from 'react'
import TripForm from './components/TripForm'
import MapView  from './components/MapView'

function App() {
  const [result, setResult] = useState(null)

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🚛 ELD Trip Planner
      </h1>

      <TripForm onResult={setResult} />

      {result && (
        <>
          {/* Map */}
          <MapView
            routeData={result.route}
            locations={result.locations}
          />

          {/* Summary */}
          <div style={{
            marginTop:    '30px',
            background:   '#fff',
            padding:      '20px',
            borderRadius: '10px',
            boxShadow:    '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '12px' }}>📋 Trip Summary</h2>
            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap:                 '16px',
              textAlign:           'center'
            }}>
              {[
                { label: 'Total Days',     value: result.summary.days },
                { label: 'Total Miles',    value: result.route.total_miles },
                { label: 'Driving Hours',  value: result.summary.total_driving },
                { label: 'Rest Hours',     value: result.summary.total_rest },
              ].map(item => (
                <div key={item.label} style={{
                  background:   '#f0f2f5',
                  padding:      '16px',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize:   '28px',
                    fontWeight: '700',
                    color:      '#1a1a2e'
                  }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App