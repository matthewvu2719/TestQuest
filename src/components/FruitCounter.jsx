import React from 'react'

function FruitCounter({ totalFruits }) {
  return (
    <div className="fruit-counter">
      <img src="/img/Apple.png" alt="fruit" className="fruit-icon" />
      <span className="fruit-count">{totalFruits}</span>
    </div>
  )
}

export default FruitCounter
