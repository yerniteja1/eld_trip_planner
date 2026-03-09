import { useState } from 'react'
import axios        from 'axios'
import LocationInput from './LocationInput'

export default function TripForm({ onResult, onLoading }) {
  const [locations, setLocations] = useState({
    current_location:  '',
    pickup_location:   '',
    dropoff_location:  '',
  })
  const [cycleHours, setCycleHours] = useState('')
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)

  function setLoc(field, val) {
    setLocations(prev => ({ ...prev, [field]: val || '' }))
  }

  function validate() {
    if (!locations.current_location)  return 'Please select a current location'
    if (!locations.pickup_location)   return 'Please select a pickup location'
    if (!locations.dropoff_location)  return 'Please select a dropoff location'
    if (cycleHours === '')            return 'Please enter cycle hours used'
    if (cycleHours < 0 || cycleHours > 70) return 'Cycle hours must be between 0 and 70'
    return null
  }

  async function handleSubmit() {
    const err = validate()
    if (err) { setError(err); return }

    setError('')
    setLoading(true)
    onLoading && onLoading(true)

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/plan-trip/', {
        ...locations,
        cycle_used_hours: cycleHours,
      })
      onResult(res.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
      onLoading && onLoading(false)
    }
  }

  return (
    <div>
      <LocationInput
        label="📍 Current Location"
        placeholder="e.g. Chicago, IL"
        value={locations.current_location}
        onChange={val => setLoc('current_location', val)}
      />

      <LocationInput
        label="📦 Pickup Location"
        placeholder="e.g. Dallas, TX"
        value={locations.pickup_location}
        onChange={val => setLoc('pickup_location', val)}
      />

      <LocationInput
        label="🏁 Dropoff Location"
        placeholder="e.g. Los Angeles, CA"
        value={locations.dropoff_location}
        onChange={val => setLoc('dropoff_location', val)}
      />

      {/* Cycle hours */}
      <div style={{ marginTop: '16px' }}>
        <label style={{
          display:    'block',
          fontWeight: '600',
          fontSize:   '13px',
          color:      '#444',
          marginBottom: '5px',
        }}>
          ⏱️ Current Cycle Hours Used (0 – 70)
        </label>
        <input
          type="number"
          min="0"
          max="70"
          placeholder="e.g. 20"
          value={cycleHours}
          onChange={e => setCycleHours(e.target.value)}
          style={{
            width:        '100%',
            padding:      '10px 14px',
            fontSize:     '14px',
            border:       '1.5px solid #ddd',
            borderRadius: '7px',
            outline:      'none',
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop:    '12px',
          padding:      '10px 14px',
          background:   '#fef2f2',
          border:       '1px solid #fca5a5',
          borderRadius: '7px',
          color:        '#b91c1c',
          fontSize:     '13px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          marginTop:    '20px',
          width:        '100%',
          padding:      '13px',
          fontSize:     '15px',
          fontWeight:   '700',
          background:   loading
            ? '#94a3b8'
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color:        '#fff',
          border:       'none',
          borderRadius: '8px',
          cursor:       loading ? 'not-allowed' : 'pointer',
          letterSpacing:'0.3px',
        }}
      >
        {loading ? '⏳ Calculating...' : '🚛 Calculate Route & ELD Logs'}
      </button>
    </div>
  )
}