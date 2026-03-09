import { useState } from 'react'
import TripForm  from './components/TripForm'
import MapView   from './components/MapView'
import ELDLog    from './components/ELDLog'
import StopsList from './components/StopsList'

// ── Reusable section wrapper ──────────────────────────
function Section({ children, style }) {
  return (
    <div style={{
      background:   '#fff',
      borderRadius: '12px',
      boxShadow:    '0 2px 12px rgba(0,0,0,0.08)',
      overflow:     'hidden',
      marginTop:    '28px',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Section header bar ────────────────────────────────
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{
      background:  'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color:       '#fff',
      padding:     '14px 20px',
      display:     'flex',
      alignItems:  'center',
      gap:         '10px',
    }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <div>
        <div style={{ fontWeight: '700', fontSize: '15px' }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: '12px', opacity: 0.7 }}>{subtitle}</div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Top navbar ── */}
      <nav style={{
        background:    'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color:         '#fff',
        padding:       '0 24px',
        height:        '60px',
        display:       'flex',
        alignItems:    'center',
        justifyContent:'space-between',
        boxShadow:     '0 2px 10px rgba(0,0,0,0.3)',
        position:      'sticky',
        top:           0,
        zIndex:        1000,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🚛</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>
              ELD Trip Planner
            </div>
            <div style={{ fontSize: '11px', opacity: 0.6 }}>
              FMCSA HOS Compliant
            </div>
          </div>
        </div>
        <div style={{
          fontSize:     '12px',
          opacity:      0.6,
          textAlign:    'right',
          lineHeight:   1.5,
        }}>
          Property Carrier<br/>No Adverse Conditions
        </div>
      </nav>

      {/* ── Page content ── */}
      <div style={{
        maxWidth: '960px',
        margin:   '0 auto',
        padding:  '0 20px 60px',
      }}>

        {/* Trip Form */}
        <Section>
          <SectionHeader
            icon="📍"
            title="Enter Trip Details"
            subtitle="Fill in all 4 fields to generate your ELD logs"
          />
          <div style={{ padding: '20px' }}>
            <TripForm
              onResult={setResult}
              onLoading={setLoading}
            />
          </div>
        </Section>

        {/* Loading spinner */}
        {loading && (
          <div style={{
            textAlign:  'center',
            padding:    '50px',
            marginTop:  '28px',
            background: '#fff',
            borderRadius:'12px',
            boxShadow:  '0 2px 12px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              width:        '48px',
              height:       '48px',
              border:       '4px solid #f0f2f5',
              borderTop:    '4px solid #1a1a2e',
              borderRadius: '50%',
              margin:       '0 auto 16px',
              animation:    'spin 0.8s linear infinite',
            }}/>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Calculating route and HOS schedule...
            </p>
          </div>
        )}

        {result && !loading && (
          <>
            {/* ── Summary cards ── */}
            <Section>
              <SectionHeader
                icon="📋"
                title="Trip Summary"
                subtitle={`${result.locations.current.display_name} → ${result.locations.dropoff.display_name}`}
              />
              <div style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap:                 '1px',
                background:          '#f0f2f5',
              }}>
                {[
                  {
                    icon:  '📅',
                    label: 'Total Days',
                    value: result.summary.days,
                    unit:  'days',
                  },
                  {
                    icon:  '📏',
                    label: 'Total Miles',
                    value: result.route.total_miles,
                    unit:  'miles',
                  },
                  {
                    icon:  '⏱️',
                    label: 'Driving Hours',
                    value: result.summary.total_driving,
                    unit:  'hrs',
                  },
                  {
                    icon:  '🛌',
                    label: 'Rest Hours',
                    value: result.summary.total_rest,
                    unit:  'hrs',
                  },
                ].map(item => (
                  <div key={item.label} style={{
                    background: '#fff',
                    padding:    '20px',
                    textAlign:  'center',
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>
                      {item.icon}
                    </div>
                    <div style={{
                      fontSize:   '26px',
                      fontWeight: '800',
                      color:      '#1a1a2e',
                    }}>
                      {item.value}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color:    '#888',
                      marginTop:'2px',
                    }}>
                      {item.unit} — {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── Route Map ── */}
            <Section>
              <SectionHeader
                icon="🗺️"
                title="Route Map"
                subtitle={`${result.route.total_miles} miles total`}
              />
              <MapView
                routeData={result.route}
                locations={result.locations}
              />
            </Section>

            {/* ── Day by day ── */}
            <Section>
              <SectionHeader
                icon="🗓️"
                title="Day-by-Day Schedule"
                subtitle={`${result.summary.days} days including rest stops`}
              />
              <div style={{ padding: '20px' }}>
                <StopsList
                  schedule={result.schedule}
                  summary={result.summary}
                />
              </div>
            </Section>

            {/* ── ELD Logs ── */}
            <Section>
              <SectionHeader
                icon="📄"
                title="ELD Daily Log Sheets"
                subtitle={`${result.summary.days} logs — FMCSA compliant format`}
              />

              {/* Legend */}
              <div style={{
                display:    'flex',
                gap:        '20px',
                padding:    '12px 20px',
                borderBottom:'1px solid #f0f2f5',
                flexWrap:   'wrap',
                fontSize:   '12px',
              }}>
                {[
                  { color: '#22c55e', label: 'Off Duty'             },
                  { color: '#3b82f6', label: 'Sleeper Berth'        },
                  { color: '#ef4444', label: 'Driving'              },
                  { color: '#f59e0b', label: 'On Duty (Not Driving)' },
                ].map(item => (
                  <span key={item.label} style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        '6px',
                  }}>
                    <span style={{
                      width:        '12px',
                      height:       '12px',
                      background:   item.color,
                      borderRadius: '3px',
                      display:      'inline-block',
                      flexShrink:   0,
                    }}/>
                    {item.label}
                  </span>
                ))}
              </div>

              <div style={{ padding: '20px' }}>
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
            </Section>

          </>
        )}
      </div>
    </div>
  )
}