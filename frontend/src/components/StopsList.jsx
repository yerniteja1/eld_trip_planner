const TYPE_CONFIG = {
  driving: {
    icon:       '🚛',
    label:      'Driving',
    background: '#fef2f2',
    border:     '#ef4444',
    color:      '#b91c1c',
  },
  on_duty_not_driving: {
    icon:       '⚙️',
    label:      'On Duty',
    background: '#fffbeb',
    border:     '#f59e0b',
    color:      '#b45309',
  },
  off_duty: {
    icon:       '🛌',
    label:      'Off Duty',
    background: '#f0fdf4',
    border:     '#22c55e',
    color:      '#15803d',
  },
  sleeper_berth: {
    icon:       '🛏️',
    label:      'Sleeper Berth',
    background: '#eff6ff',
    border:     '#3b82f6',
    color:      '#1d4ed8',
  },
}

function formatDuration(hours) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function DayCard({ day, segments, dayNumber }) {
  const drivingHrs = segments
    .filter(s => s.type === 'driving')
    .reduce((sum, s) => sum + s.duration, 0)

  const restHrs = segments
    .filter(s => s.type === 'off_duty' || s.type === 'sleeper_berth')
    .reduce((sum, s) => sum + s.duration, 0)

  const miles = segments
    .reduce((sum, s) => sum + (s.miles || 0), 0)

  return (
    <div style={{
      background:   '#fff',
      borderRadius: '10px',
      overflow:     'hidden',
      boxShadow:    '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '16px',
    }}>
      {/* Day header */}
      <div style={{
        background: '#1a1a2e',
        color:      '#fff',
        padding:    '12px 16px',
        display:    'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontWeight: '700', fontSize: '15px' }}>
          Day {dayNumber}
        </span>
        <div style={{
          display: 'flex',
          gap:     '20px',
          fontSize:'13px',
          opacity: 0.85,
        }}>
          <span>🚛 {Math.round(miles)} mi</span>
          <span>⏱ {formatDuration(drivingHrs)} driving</span>
          <span>🛌 {formatDuration(restHrs)} rest</span>
        </div>
      </div>

      {/* Segments */}
      <div style={{ padding: '12px 16px' }}>
        {segments.map((seg, i) => {
          const cfg = TYPE_CONFIG[seg.type] || TYPE_CONFIG.off_duty

          return (
            <div
              key={i}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '12px',
                padding:      '10px 12px',
                marginBottom: '8px',
                background:   cfg.background,
                borderLeft:   `4px solid ${cfg.border}`,
                borderRadius: '6px',
              }}
            >
              {/* Icon */}
              <span style={{ fontSize: '20px' }}>{cfg.icon}</span>

              {/* Label + sublabel */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: '600',
                  fontSize:   '14px',
                  color:      cfg.color,
                }}>
                  {seg.label}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {cfg.label}
                  {seg.miles > 0 && ` — ${Math.round(seg.miles)} miles`}
                </div>
              </div>

              {/* Duration badge */}
              <div style={{
                background:   cfg.border,
                color:        '#fff',
                padding:      '4px 10px',
                borderRadius: '20px',
                fontSize:     '12px',
                fontWeight:   '600',
                whiteSpace:   'nowrap',
              }}>
                {formatDuration(seg.duration)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function StopsList({ schedule, summary }) {
  return (
    <div style={{ marginTop: '30px' }}>

      <h2 style={{ marginBottom: '16px' }}>
        🗓️ Day-by-Day Schedule
      </h2>

      {/* Overall stats bar */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap:                 '12px',
        marginBottom:        '20px',
      }}>
        {[
          {
            icon:  '📅',
            label: 'Trip Duration',
            value: `${summary.days} days`,
          },
          {
            icon:  '🚛',
            label: 'Total Driving',
            value: `${summary.total_driving} hrs`,
          },
          {
            icon:  '🛌',
            label: 'Total Rest',
            value: `${summary.total_rest} hrs`,
          },
        ].map(item => (
          <div
            key={item.label}
            style={{
              background:   '#fff',
              padding:      '14px',
              borderRadius: '8px',
              boxShadow:    '0 2px 6px rgba(0,0,0,0.07)',
              display:      'flex',
              alignItems:   'center',
              gap:          '12px',
            }}
          >
            <span style={{ fontSize: '28px' }}>{item.icon}</span>
            <div>
              <div style={{
                fontWeight: '700',
                fontSize:   '18px',
                color:      '#1a1a2e',
              }}>
                {item.value}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* One card per day */}
      {schedule.map((segments, i) => (
        <DayCard
          key={i}
          dayNumber={i + 1}
          segments={segments}
          day={summary.day_summaries[i]}
        />
      ))}

    </div>
  )
}