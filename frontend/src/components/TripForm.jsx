import { useState } from 'react'
import axios from 'axios'

export default function TripForm({ onResult, onLoading }) {
  const [form, setForm] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    cycle_used_hours: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    onLoading && onLoading(true)

    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/plan-trip/',
        form
      )
      onResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
      onLoading && onLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    fontSize: '15px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    marginTop: '6px'
  }

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    marginTop: '16px',
    fontSize: '14px'
  }

  return (
    <div style={{
      background: '#fff',
      padding: '24px',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '10px' }}>Enter Trip Details</h2>

      <label style={labelStyle}>Current Location</label>
      <input
        style={inputStyle}
        name="current_location"
        placeholder="e.g. Chicago, IL"
        value={form.current_location}
        onChange={handleChange}
      />

      <label style={labelStyle}>Pickup Location</label>
      <input
        style={inputStyle}
        name="pickup_location"
        placeholder="e.g. Dallas, TX"
        value={form.pickup_location}
        onChange={handleChange}
      />

      <label style={labelStyle}>Dropoff Location</label>
      <input
        style={inputStyle}
        name="dropoff_location"
        placeholder="e.g. Los Angeles, CA"
        value={form.dropoff_location}
        onChange={handleChange}
      />

      <label style={labelStyle}>Current Cycle Hours Used (0–70)</label>
      <input
        style={inputStyle}
        name="cycle_used_hours"
        type="number"
        min="0"
        max="70"
        placeholder="e.g. 20"
        value={form.cycle_used_hours}
        onChange={handleChange}
      />

      {error && (
        <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          marginTop: '20px',
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          fontWeight: '600',
          background: loading ? '#aaa' : '#1a1a2e',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '⏳ Calculating...' : '🚛 Calculate Route & ELD Logs'}
      </button>
    </div>
  )
}