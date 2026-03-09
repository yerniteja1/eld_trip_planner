import { useEffect, useRef } from 'react'

const COLORS = {
  driving:             '#ef4444',
  on_duty_not_driving: '#f59e0b',
  off_duty:            '#22c55e',
  sleeper_berth:       '#3b82f6',
}

const ROW_LABELS = ['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty\n(Not Driving)']

const ROW_MAP = {
  off_duty:            0,
  sleeper_berth:       1,
  driving:             2,
  on_duty_not_driving: 3,
}

function drawMultiline(ctx, text, x, y, lineHeight) {
  text.split('\n').forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight))
}

function formatHour(decimalHour) {
  const h = Math.floor(decimalHour) % 24
  const m = Math.round((decimalHour - Math.floor(decimalHour)) * 60)
  const period = h < 12 ? 'AM' : 'PM'
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${display}:${String(m).padStart(2, '0')} ${period}`
}

function remarkLabel(seg, hourOffset) {
  const time = formatHour(hourOffset)
  if (seg.type === 'driving')             return `${time} — Driving${seg.miles ? ` (${Math.round(seg.miles)} mi)` : ''}`
  if (seg.type === 'on_duty_not_driving') return `${time} — ${seg.label}`
  if (seg.type === 'off_duty')            return `${time} — Rest / Off Duty`
  if (seg.type === 'sleeper_berth')       return `${time} — Sleeper Berth`
  return `${time} — ${seg.label}`
}

export default function ELDLog({ daySegments, dayNumber, totalMiles }) {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const W      = canvas.width
    const H      = canvas.height

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    // ── Layout ────────────────────────────────────────
    const ML          = 100   // margin left
    const MT          = 108   // margin top (grid starts here)
    const GRID_W      = W - ML - 80
    const ROW_H       = 40
    const GRID_H      = ROW_H * 4
    const HOUR_W      = GRID_W / 24
    const QUARTER_W   = HOUR_W / 4  // 15-min ticks

    // ── Header ─────────────────────────────
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, W, 48)

    ctx.fillStyle  = '#ffffff'
    ctx.font       = 'bold 14px Arial'
    ctx.textAlign  = 'center'
    ctx.fillText("DRIVER'S DAILY LOG  (24 Hours)", W / 2, 20)
    ctx.font       = '11px Arial'
    ctx.fillStyle  = 'rgba(255,255,255,0.65)'
    ctx.fillText('Original: Driver    Copy 1: Motor Carrier    Copy 2: Retained by Driver', W / 2, 38)

    // ── Header info row ───────────────────────────────
    ctx.fillStyle  = '#1a1a2e'
    ctx.font       = '11px Arial'
    ctx.textAlign  = 'left'

    const today    = new Date()
    const d        = new Date(today)
    d.setDate(d.getDate() + dayNumber - 1)
    const dateStr  = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`

    const fields = [
      [`Date: ${dateStr}`,            ML],
      [`Day ${dayNumber} of Trip`,    ML + 150],
      [`Miles Today: ${Math.round(totalMiles || 0)}`, ML + 300],
      ['Carrier: ELD Trip Planner',   ML + 460],
    ]
    fields.forEach(([text, x]) => {
      ctx.fillStyle = '#555'
      ctx.fillText(text, x, 68)
    })

    // Underlines for header fields
    ctx.strokeStyle = '#ccc'
    ctx.lineWidth   = 0.5
    fields.forEach(([text, x]) => {
      const w = ctx.measureText(text).width + 20
      ctx.beginPath()
      ctx.moveTo(x, 72)
      ctx.lineTo(x + w, 72)
      ctx.stroke()
    })

    // ── Hour labels ───────────────────────────────────
    ctx.fillStyle = '#333'
    ctx.font      = '10px Arial'
    ctx.textAlign = 'center'
    for (let h = 0; h <= 24; h++) {
      const x = ML + h * HOUR_W
      const label =
        h === 0  ? 'Mid' :
        h === 12 ? 'Noon' :
        h === 24 ? 'Mid' :
        String(h)
      ctx.fillText(label, x, MT - 8)
    }

    // ── Grid background ───────────────────────────────
    ctx.fillStyle = '#fafafa'
    ctx.fillRect(ML, MT, GRID_W, GRID_H)

    // ── 15-minute tick marks above grid ───────────────
    for (let q = 0; q <= 24 * 4; q++) {
      const x          = ML + q * QUARTER_W
      const isHour     = q % 4 === 0
      const isHalfHour = q % 2 === 0

      ctx.strokeStyle = '#aaa'
      ctx.lineWidth   = isHour ? 0 : 0.5

      if (!isHour) {
        const tickH = isHalfHour ? 6 : 3
        ctx.beginPath()
        ctx.moveTo(x, MT - tickH)
        ctx.lineTo(x, MT)
        ctx.stroke()
      }
    }

    // ── Vertical grid lines ───────────────────────────
    for (let h = 0; h <= 24; h++) {
      const x = ML + h * HOUR_W
      ctx.strokeStyle = h % 6 === 0 ? '#888' : '#ddd'
      ctx.lineWidth   = h % 6 === 0 ? 1.5    : 0.8
      ctx.beginPath()
      ctx.moveTo(x, MT)
      ctx.lineTo(x, MT + GRID_H)
      ctx.stroke()
    }

    // ── Horizontal row dividers ───────────────────────
    for (let r = 0; r <= 4; r++) {
      const y = MT + r * ROW_H
      ctx.strokeStyle = '#888'
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.moveTo(ML, y)
      ctx.lineTo(ML + GRID_W, y)
      ctx.stroke()
    }

    // ── Row labels ────────────────────────────────────
    ctx.fillStyle = '#333'
    ctx.font      = '10px Arial'
    ctx.textAlign = 'right'
    ROW_LABELS.forEach((label, i) => {
      const y = MT + i * ROW_H + ROW_H / 2 - 4
      drawMultiline(ctx, label, ML - 6, y, 12)
    })

    // ── Row number labels (1-4) ───────────────────────
    ctx.fillStyle = '#aaa'
    ctx.font      = '9px Arial'
    ctx.textAlign = 'left'
    for (let r = 0; r < 4; r++) {
      ctx.fillText(String(r + 1), ML + GRID_W + 6, MT + r * ROW_H + 14)
    }

    // ── Draw continuous step line ─────────────────────
    let currentHour = 0
    let prevRow     = ROW_MAP[daySegments[0]?.type] ?? 0

    daySegments.forEach((seg, idx) => {
      const row      = ROW_MAP[seg.type] ?? 0
      const color    = COLORS[seg.type]  ?? '#333'
      const startX   = ML + currentHour * HOUR_W
      const endX     = ML + (currentHour + seg.duration) * HOUR_W
      const prevMidY = MT + prevRow * ROW_H + ROW_H / 2
      const midY     = MT + row    * ROW_H + ROW_H / 2

      ctx.strokeStyle = color
      ctx.lineWidth   = 2.5
      ctx.lineJoin    = 'miter'

      // 1. Vertical transition from previous row to this row
      if (idx > 0 && prevRow !== row) {
        ctx.beginPath()
        ctx.moveTo(startX, prevMidY)
        ctx.lineTo(startX, midY)
        ctx.stroke()
      }

      // 2. Horizontal line across this segment's duration
      ctx.beginPath()
      ctx.moveTo(startX, midY)
      ctx.lineTo(endX,   midY)
      ctx.stroke()

      prevRow     = row
      currentHour += seg.duration
    })

    // ── Per-row totals on the right ───────────────────
    const totals = { off_duty: 0, sleeper_berth: 0, driving: 0, on_duty_not_driving: 0 }
    daySegments.forEach(s => { if (totals[s.type] !== undefined) totals[s.type] += s.duration })

    const rowKeys = ['off_duty', 'sleeper_berth', 'driving', 'on_duty_not_driving']
    ctx.font      = 'bold 10px Arial'
    ctx.textAlign = 'left'
    rowKeys.forEach((key, i) => {
      ctx.fillStyle = COLORS[key]
      ctx.fillText(
        `${totals[key].toFixed(2)}h`,
        ML + GRID_W + 18,
        MT + i * ROW_H + ROW_H / 2 + 4
      )
    })

    // Total must = 24
    const allTotal = Object.values(totals).reduce((a, b) => a + b, 0)
    ctx.fillStyle  = '#333'
    ctx.font       = '10px Arial'
    ctx.fillText(`Total: ${allTotal.toFixed(2)} hrs`, ML + GRID_W + 18, MT + GRID_H + 14)

    // ── REMARKS section ───────────────────────────────
    const RY = MT + GRID_H + 26

    ctx.fillStyle = '#1a1a2e'
    ctx.font      = 'bold 10px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('REMARKS / LOCATION OF CHANGES:', ML, RY)

    ctx.strokeStyle = '#bbb'
    ctx.lineWidth   = 1
    ctx.strokeRect(ML, RY + 6, GRID_W, 62)

    // Grid lines inside remarks box
    ctx.strokeStyle = '#eee'
    ctx.lineWidth   = 0.5
    ctx.beginPath()
    ctx.moveTo(ML, RY + 6 + 21)
    ctx.lineTo(ML + GRID_W, RY + 6 + 21)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(ML, RY + 6 + 42)
    ctx.lineTo(ML + GRID_W, RY + 6 + 42)
    ctx.stroke()

    // Write remarks — one per segment with time + description
    let hourCursor = 0
    const remarkLines = daySegments.map(seg => {
      const text = remarkLabel(seg, hourCursor)
      hourCursor += seg.duration
      return { text, color: COLORS[seg.type] }
    })

    // Distribute remarks across 3 lines, up to 3 per line
    const perLine = Math.ceil(remarkLines.length / 3)
    const lines   = [
      remarkLines.slice(0,          perLine),
      remarkLines.slice(perLine,    perLine * 2),
      remarkLines.slice(perLine * 2),
    ]

    lines.forEach((line, lineIdx) => {
      let rx = ML + 8
      const ry = RY + 6 + 14 + lineIdx * 21

      line.forEach(({ text, color }) => {
        ctx.fillStyle = color
        ctx.font      = '9px Arial'
        ctx.fillText('● ', rx, ry)
        ctx.fillStyle = '#444'
        ctx.fillText(text, rx + 10, ry)
        rx += ctx.measureText(text).width + 24
      })
    })

    // ── Certification line ────────────────────────────
    const CY = RY + 80

    ctx.strokeStyle = '#ccc'
    ctx.lineWidth   = 0.5
    ctx.beginPath()
    ctx.moveTo(ML, CY + 16)
    ctx.lineTo(ML + 260, CY + 16)
    ctx.stroke()

    ctx.fillStyle  = '#888'
    ctx.font       = '9px Arial'
    ctx.textAlign  = 'left'
    ctx.fillText('Driver Signature', ML, CY + 26)

    ctx.beginPath()
    ctx.moveTo(ML + 300, CY + 16)
    ctx.lineTo(ML + 560, CY + 16)
    ctx.stroke()
    ctx.fillText('Co-Driver (if applicable)', ML + 300, CY + 26)

    // ── Outer border ──────────────────────────────────
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
      boxShadow:    '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <canvas
        ref={canvasRef}
        width={880}
        height={360}
        style={{ width: '100%', display: 'block' }}
      />
    </div>
  )
}