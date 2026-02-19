import React from 'react'

function FruitCounter({ totalFruits }) {
  return (
    <div className="fruit-counter">
      <span className="fruit-count">+{totalFruits}</span>
      <img src="/img/Apple.png" alt="fruit" className="fruit-icon" />
    </div>
  )
}

export default FruitCounter
