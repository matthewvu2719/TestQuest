import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react'

function LandingPage({ onEnterApp }) {
  const { user } = useUser()

  return (
    <div className="landing-page">
      <img src="/img/pig.png" alt="Pig" className="landing-decoration pig-decoration" />
      <div className="pig-speech-bubble">🐷</div>
      <img src="/img/radish.png" alt="Radish" className="landing-decoration radish-decoration" />

      <div className="landing-auth">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>

      <div className="landing-hero">
        <h1 className="hero-title">Welcome to TestQuest!</h1>
        <p className="hero-subtitle">Train, Test, and Quest your way to mastery</p>

        <SignedIn>
          <p className="landing-welcome">Hey, {user?.firstName || user?.username || 'Adventurer'}! Ready to train?</p>
          <button className="enter-app-button" onClick={onEnterApp}>
            Start Training now!
          </button>
        </SignedIn>

        <SignedOut>
          <div className="landing-auth-buttons">
            <SignInButton mode="modal">
              <button className="enter-app-button">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="enter-app-button secondary">Create Account</button>
            </SignUpButton>
          </div>
        </SignedOut>
      </div>

      <div className="landing-content">
        <div className="blueguy-guide">
          <img src="/img/blueGuy.png" alt="Guide" className="blueguy-character" />
          <div className="speech-bubble">
            <p>Train and test earn you 🍎</p>
            <ul>
              <li>Pomodoro: +10 🍎</li>
              <li>Test ≥ 90%: +20 🍎</li>
              <li>Test ≥ 80%: +10 🍎</li>
              <li>Test ≥ 70%: +5 🍎</li>
            </ul>
            <p>Use 🍎 for your quest!</p>
          </div>
        </div>

        <div className="landing-features">
          <div className="feature-card feature-train">
            <div className="feature-icon">⏰</div>
            <h3>Train</h3>
            <p>Focus with Pomodoro timer and earn rewards</p>
          </div>

          <div className="feature-card feature-test">
            <div className="feature-icon">📝</div>
            <h3>Test</h3>
            <p>Challenge yourself with AI-generated quizzes</p>
          </div>

          <div className="feature-card feature-quest">
            <img src="/img/bunnyEnemy.png" alt="Bunny" className="quest-bunny" />
            <div className="feature-icon">🎮</div>
            <h3>Quest!</h3>
            <p>Play and explore in your adventure</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
