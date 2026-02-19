import React, { useState } from 'react'

function TopicInput({ onTopicSubmit }) {
  const [topic, setTopic] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (topic.trim()) {
      onTopicSubmit(topic)
    }
  }

  return (
    <div className="topic-input-container">
      <h1 className="title">🎓 Study Time! 🎓</h1>
      <p className="subtitle">What do you want to learn today?</p>
      <form onSubmit={handleSubmit} className="topic-form">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter your study topic..."
          className="topic-input"
        />
        <button type="submit" className="start-button">
          Start Learning!
        </button>
      </form>
    </div>
  )
}

export default TopicInput
