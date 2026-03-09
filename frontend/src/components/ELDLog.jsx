import { useEffect, useRef } from 'react'

// ── Colors for each duty status ───────────────────────
const COLORS = {
  driving:             '#ef4444',
  on_duty_not_driving: '#f59e0b',
  off_duty:            '#22c55e',
  sleeper_berth:       '#3b82f6',
}

const ROW_LABELS = [
  'Off Duty',
  'Sleeper\nBerth',
  'Driving',
  'On Duty\n(Not Driving)',
]

const ROW_MAP = {
  off_duty:            0,
  sleeper_berth:       1,
  driving:             2,
  on_duty_not_driving: 3,
}

// ── Draw multiline text helper ────────────────────────
function drawMultiline(ctx, text, x, y, lineHeight) {
  text.split('\n').forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight)
  })
}

export default function ELDLog({ daySegments, dayNumber, totalMiles }) {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    // ── Canvas dimensions ─────────────────────────────
    const W = canvas.width
    const H = canvas.height

    // ── Clear ─────────────────────────────────────────
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    // ── Layout constants ──────────────────────────────
    const MARGIN_LEFT   = 90
    const MARGIN_TOP    = 110
    const GRID_WIDTH    = W - MARGIN_LEFT - 70
    const ROW_HEIGHT    = 36
    const GRID_HEIGHT   = ROW_HEIGHT * 4
    const HOUR_WIDTH    = GRID_WIDTH / 24

    // ── Header ────────────────────────────────────────
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, W, 44)

    ctx.fillStyle  = '#ffffff'
    ctx.font       = 'bold 15px Arial'
    ctx.textAlign  = 'center'
    ctx.fillText("DRIVER'S DAILY LOG  —  24 Hours", W / 2, 26)

    // ── Sub header info ───────────────────────────────
    ctx.fillStyle = '#1a1a2e'
    ctx.font      = '12px Arial'
    ctx.textAlign = 'left'

    const today = new Date()
    const dateStr = `${today.getMonth() + 1}/${
      today.getDate() + dayNumber - 1}/${today.getFullYear()}`

    ctx.fillText(`Date: ${dateStr}`,          MARGIN_LEFT,      62)
    ctx.fillText(`Day: ${dayNumber}`,          MARGIN_LEFT,      78)
    ctx.fillText(`Miles Today: ${Math.round(totalMiles || 0)}`,
                  MARGIN_LEFT + 160, 62)
    ctx.fillText('Carrier: ELD Trip Planner', MARGIN_LEFT + 160, 78)

    // ── Hour labels (Midnight, 1, 2 ... Noon ... 23) ──
    ctx.fillStyle = '#333'
    ctx.font      = '10px Arial'
    ctx.textAlign = 'center'

    for (let h = 0; h <= 24; h++) {
      const x = MARGIN_LEFT + h * HOUR_WIDTH
      let label = ''
      if      (h === 0)  label = 'Mid'
      else if (h === 12) label = 'Noon'
      else if (h === 24) label = 'Mid'
      else               label = String(h)
      ctx.fillText(label, x, MARGIN_TOP - 6)
    }

    // ── Row labels ────────────────────────────────────
    ctx.fillStyle = '#333'
    ctx.font      = '10px Arial'
    ctx.textAlign = 'right'

    ROW_LABELS.forEach((label, i) => {
      const y = MARGIN_TOP + i * ROW_HEIGHT + ROW_HEIGHT / 2
      drawMultiline(ctx, label, MARGIN_LEFT - 6, y - 4, 12)
    })

    // ── Grid background ───────────────────────────────
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(MARGIN_LEFT, MARGIN_TOP, GRID_WIDTH, GRID_HEIGHT)

    // ── Vertical hour lines ───────────────────────────
    for (let h = 0; h <= 24; h++) {
      const x = MARGIN_LEFT + h * HOUR_WIDTH
      ctx.strokeStyle = h % 6 === 0 ? '#999' : '#ddd'
      ctx.lineWidth   = h % 6 === 0 ? 1.5    : 0.8
      ctx.beginPath()
      ctx.moveTo(x, MARGIN_TOP)
      ctx.lineTo(x, MARGIN_TOP + GRID_HEIGHT)
      ctx.stroke()
    }

    // ── Horizontal row lines ──────────────────────────
    for (let r = 0; r <= 4; r++) {
      const y = MARGIN_TOP + r * ROW_HEIGHT
      ctx.strokeStyle = '#999'
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.moveTo(MARGIN_LEFT, y)
      ctx.lineTo(MARGIN_LEFT + GRID_WIDTH, y)
      ctx.stroke()
    }

    // ── Draw activity lines ───────────────────────────
    let currentHour = 0

    daySegments.forEach((seg) => {
      const row    = ROW_MAP[seg.type]
      const startX = MARGIN_LEFT + currentHour * HOUR_WIDTH
      const endX   = MARGIN_LEFT + (currentHour + seg.duration) * HOUR_WIDTH
      const midY   = MARGIN_TOP + row * ROW_HEIGHT + ROW_HEIGHT / 2
      const topY   = MARGIN_TOP + row * ROW_HEIGHT
      const botY   = MARGIN_TOP + row * ROW_HEIGHT + ROW_HEIGHT

      ctx.strokeStyle = COLORS[seg.type]
      ctx.lineWidth   = 3

      // Vertical drop line at start
      ctx.beginPath()
      ctx.moveTo(startX, MARGIN_TOP)
      ctx.lineTo(startX, botY)
      ctx.stroke()

      // Horizontal line across duration
      ctx.beginPath()
      ctx.moveTo(startX, midY)
      ctx.lineTo(endX,   midY)
      ctx.stroke()

      // Vertical rise at end
      ctx.beginPath()
      ctx.moveTo(endX, topY)
      ctx.lineTo(endX, MARGIN_TOP + GRID_HEIGHT)
      ctx.stroke()

      // Fill the row area lightly
      ctx.fillStyle   = COLORS[seg.type] + '22'
      ctx.fillRect(
        startX,
        MARGIN_TOP + row * ROW_HEIGHT,
        endX - startX,
        ROW_HEIGHT
      )

      currentHour += seg.duration
    })

    // ── Total hours per row ───────────────────────────
    const totals = {
      off_duty:            0,
      sleeper_berth:       0,
      driving:             0,
      on_duty_not_driving: 0,
    }
    daySegments.forEach(s => {
      if (totals[s.type] !== undefined) totals[s.type] += s.duration
    })

    const rowKeys = [
      'off_duty',
      'sleeper_berth',
      'driving',
      'on_duty_not_driving'
    ]

    ctx.font      = 'bold 11px Arial'
    ctx.textAlign = 'left'

    rowKeys.forEach((key, i) => {
      const y = MARGIN_TOP + i * ROW_HEIGHT + ROW_HEIGHT / 2 + 4
      ctx.fillStyle = COLORS[key]
      ctx.fillText(
        `${totals[key].toFixed(2)} hrs`,
        MARGIN_LEFT + GRID_WIDTH + 8,
        y
      )
    })

    // ── Total hours must equal 24 label ──────────────
    const allTotal = Object.values(totals).reduce((a, b) => a + b, 0)
    ctx.fillStyle = '#333'
    ctx.font      = '10px Arial'
    ctx.fillText(
      `Total: ${allTotal.toFixed(2)} hrs`,
      MARGIN_LEFT + GRID_WIDTH + 8,
      MARGIN_TOP + GRID_HEIGHT + 14
    )

    // ── Remarks section ───────────────────────────────
    const remarksY = MARGIN_TOP + GRID_HEIGHT + 30

    ctx.fillStyle = '#1a1a2e'
    ctx.font      = 'bold 11px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('REMARKS:', MARGIN_LEFT, remarksY)

    ctx.strokeStyle = '#ccc'
    ctx.lineWidth   = 1
    ctx.strokeRect(MARGIN_LEFT, remarksY + 6, GRID_WIDTH, 50)

    // Write segment labels as remarks
    ctx.fillStyle = '#555'
    ctx.font      = '10px Arial'
    let remarkX   = MARGIN_LEFT + 6
    let remarkY   = remarksY + 20

    daySegments.forEach((seg, i) => {
      const text = `${seg.label} (${seg.duration.toFixed(2)}h)`
      if (remarkX + 160 > MARGIN_LEFT + GRID_WIDTH) {
        remarkX  = MARGIN_LEFT + 6
        remarkY += 14
      }
      ctx.fillStyle = COLORS[seg.type]
      ctx.fillText('● ', remarkX, remarkY)
      ctx.fillStyle = '#555'
      ctx.fillText(text, remarkX + 10, remarkY)
      remarkX += ctx.measureText(text).width + 24
    })

    // ── Bottom border ─────────────────────────────────
    ctx.strokeStyle = '#1a1a2e'
    ctx.lineWidth   = 2
    ctx.strokeRect(1, 1, W - 2, H - 2)

  }, [daySegments, dayNumber, totalMiles])

  return (
    <div style={{
      marginBottom: '20px',
      background:   '#fff',
      borderRadius: '10px',
      overflow:     'hidden',
      boxShadow:    '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <canvas
        ref={canvasRef}
        width={860}
        height={310}
        style={{ width: '100%', display: 'block' }}
      />
    </div>
  )
}