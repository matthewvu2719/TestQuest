import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'

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
          <SignInButton mode="modal">
            <button className="enter-app-button">Start Now</button>
          </SignInButton>
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
            <div className="feature-icon">📖</div>
            <h3>Train</h3>
            <p>Train with Pomodoro timer and AI-generated notes, flashcards and diagrams</p>
          </div>

          <div className="feature-card feature-test">
            <div className="feature-icon">📝</div>
            <h3>Test</h3>
            <p>Challenge yourself with AI-generated MCQ, short and long answer exams</p>
          </div>

          <div className="feature-card feature-quest">
            <img src="/img/bunnyEnemy.png" alt="Bunny" className="quest-bunny" />
            <div className="feature-icon">🎮</div>
            <h3>Quest!</h3>
            <p>Spend your earned fruits to battle enemies in an RPG adventure</p>
          </div>
        </div>

        <div className="landing-how-it-works">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h4>Enter a Topic</h4>
              <p>Type any subject: history, science, math, coding, etc. Our AI fetches real web sources instantly.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h4>AI Builds Your Session</h4>
              <p>Lecture notes, flashcards, diagrams, and a full exam are generated automatically using Gemini AI and Tavily RAG.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h4>Train & Earn fruits</h4>
              <p>Use the Pomodoro timer to focus. Complete study sessions to earn fruits rewards.</p>
            </div>
            <div className="step-card">
              <div className="step-number">04</div>
              <h4>Take the Exam</h4>
              <p>10 MCQ, 10 short answer, 2 long answer questions. Get personalized AI feedback on your weak spots.</p>
            </div>
            <div className="step-card">
              <div className="step-number">05</div>
              <h4>Spend fruits on Quest</h4>
              <p>Use earned fruits to play the adventure game. Defeat enemies and explore the world!</p>
            </div>
            <div className="step-card">
              <div className="step-number">06</div>
              <h4>Gets Smarter Over Time</h4>
              <p>Pinecone vector memory remembers your past sessions and enriches future study material on related topics.</p>
            </div>
          </div>
        </div>

        <div className="landing-tech">
          <h2 className="section-title">Built With</h2>
          <div className="tech-grid">
            <span className="tech-badge">React + Vite</span>
            <span className="tech-badge">Python + FastAPI</span>
            <span className="tech-badge">LangGraph</span>
            <span className="tech-badge">Gemini AI</span>
            <span className="tech-badge">Tavily RAG</span>
            <span className="tech-badge">Pinecone</span>
            <span className="tech-badge">Clerk Auth</span>
            <span className="tech-badge">Docker</span>
            <span className="tech-badge">Google Cloud Run</span>
            <span className="tech-badge">C# + Unity + WebGL</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
