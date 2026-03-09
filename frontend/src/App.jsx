import { useState } from 'react'
import TripForm from './components/TripForm'
import MapView  from './components/MapView'
import ELDLog   from './components/ELDLog'

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

          {/* Summary cards */}
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
                { label: 'Total Days',    value: result.summary.days },
                { label: 'Total Miles',   value: result.route.total_miles },
                { label: 'Driving Hours', value: result.summary.total_driving },
                { label: 'Rest Hours',    value: result.summary.total_rest },
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

          {/* ELD Log Sheets */}
          <div style={{ marginTop: '30px' }}>
            <h2 style={{ marginBottom: '16px' }}>
              📄 ELD Daily Logs ({result.summary.days} days)
            </h2>

            {/* Legend */}
            <div style={{
              display:      'flex',
              gap:          '20px',
              marginBottom: '16px',
              background:   '#fff',
              padding:      '12px 16px',
              borderRadius: '8px',
              fontSize:     '13px',
              flexWrap:     'wrap'
            }}>
              {[
                { color: '#22c55e', label: 'Off Duty'            },
                { color: '#3b82f6', label: 'Sleeper Berth'       },
                { color: '#ef4444', label: 'Driving'             },
                { color: '#f59e0b', label: 'On Duty (Not Driving)'},
              ].map(item => (
                <span key={item.label} style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        '6px'
                }}>
                  <span style={{
                    width:        '14px',
                    height:       '14px',
                    background:   item.color,
                    borderRadius: '3px',
                    display:      'inline-block'
                  }}/>
                  {item.label}
                </span>
              ))}
            </div>

            {/* One log per day */}
            {result.schedule.map((daySegments, i) => {
              const dayMiles = daySegments.reduce(
                (sum, s) => sum + (s.miles || 0), 0
              )
              return (
                <ELDLog
                  key={i}
                  dayNumber={i + 1}
                  daySegments={daySegments}
                  totalMiles={dayMiles}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default App