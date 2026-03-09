import { useState, useEffect, useRef } from 'react'

const ORS_API_KEY = 'ORS_API_KEY'

export default function LocationInput({ label, value, onChange, placeholder }) {
  const [query,       setQuery]       = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [loading,     setLoading]     = useState(false)
  const [open,        setOpen]        = useState(false)
  const debounceRef  = useRef(null)
  const wrapperRef   = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleType(e) {
    const val = e.target.value
    setQuery(val)
    onChange(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (val.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://api.openrouteservice.org/geocode/autocomplete` +
          `?api_key=${ORS_API_KEY}` +
          `&text=${encodeURIComponent(val)}` +
          `&boundary.country=US` +
          `&layers=locality,region` +
          `&size=6`
        )
        const data = await res.json()
        const features = data.features || []
        setSuggestions(features.map(f => ({
          label: f.properties.label,
          lat:   f.geometry.coordinates[1],
          lng:   f.geometry.coordinates[0],
        })))
        setOpen(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 500) // 500ms debounce
  }

  function handleSelect(suggestion) {
    setQuery(suggestion.label)
    onChange(suggestion.label)
    setSuggestions([])
    setOpen(false)
  }

  const isConfirmed = !!value

  return (
    <div ref={wrapperRef} style={{ position: 'relative', marginTop: '16px' }}>

      {/* Label */}
      <label style={{
        display:    'block',
        fontWeight: '600',
        fontSize:   '13px',
        color:      '#444',
        marginBottom: '5px',
      }}>
        {label}
      </label>

      {/* Input row */}
      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onChange={handleType}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          style={{
            width:        '100%',
            padding:      '10px 38px 10px 14px',
            fontSize:     '14px',
            border:       `1.5px solid ${isConfirmed ? '#22c55e' : '#ddd'}`,
            borderRadius: '7px',
            outline:      'none',
            background:   isConfirmed ? '#f0fdf4' : '#fff',
            transition:   'border 0.2s',
          }}
        />

        {/* Right icon — spinner / checkmark / pin */}
        <span style={{
          position:  'absolute',
          right:     '12px',
          top:       '50%',
          transform: 'translateY(-50%)',
          fontSize:  '16px',
          pointerEvents: 'none',
        }}>
          {loading     ? '⏳' :
           isConfirmed ? '✅' :
           query       ? '📍' : '🔍'}
        </span>
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div style={{
          position:   'absolute',
          top:        '100%',
          left:       0,
          right:      0,
          background: '#fff',
          border:     '1.5px solid #e5e7eb',
          borderTop:  'none',
          borderRadius: '0 0 8px 8px',
          boxShadow:  '0 8px 24px rgba(0,0,0,0.12)',
          zIndex:     9999,
          overflow:   'hidden',
        }}>
          {suggestions.map((s, i) => (
            <div
              key={i}
              onMouseDown={() => handleSelect(s)}
              style={{
                padding:    '10px 14px',
                fontSize:   '13px',
                cursor:     'pointer',
                display:    'flex',
                alignItems: 'center',
                gap:        '8px',
                borderBottom: i < suggestions.length - 1
                  ? '1px solid #f3f4f6'
                  : 'none',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <span style={{ fontSize: '16px' }}>📍</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {open && !loading && query.length >= 2 && suggestions.length === 0 && (
        <div style={{
          position:   'absolute',
          top:        '100%',
          left:       0,
          right:      0,
          background: '#fff',
          border:     '1.5px solid #e5e7eb',
          borderTop:  'none',
          borderRadius: '0 0 8px 8px',
          padding:    '10px 14px',
          fontSize:   '13px',
          color:      '#888',
          zIndex:     9999,
        }}>
          No locations found for "{query}"
        </div>
      )}
    </div>
  )
}