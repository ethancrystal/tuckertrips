'use client'

import React from 'react'

const ShinyText = ({ text = '', disabled = false, speed = 3, className = '' }) => {
  if (disabled) {
    return <span className={className}>{text}</span>
  }

  const duration = Math.max(0.5, 6 / (Number(speed) || 3))

  return (
    <span
      className={`relative inline-block tt-shiny-text select-none ${className}`}
      style={{
        ['--tt-duration']: `${duration}s`,
      }}
    >
      {text}
    </span>
  )
}

export default ShinyText
