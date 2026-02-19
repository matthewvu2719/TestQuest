import { useState } from 'react'
import PomodoroTimer from './components/PomodoroTimer'
import Quiz from './components/Quiz'
import FruitCounter from './components/FruitCounter'
import QuestGame from './components/QuestGame'
import TopicInput from './components/TopicInput'

function App() {
  const [questions, setQuestions] = useState([])
  const [pomodoroCompleted, setPomodoroCompleted] = useState(true)
  const [totalFruits, setTotalFruits] = useState(0)
  const [activeTab, setActiveTab] = useState('training')
  const [topic, setTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [quizState, setQuizState] = useState({
    currentQuestion: 0,
    selectedAnswers: {},
    showResults: false,
    reviewMode: false
  })
  const [showFruitAdded, setShowFruitAdded] = useState(false)

  const resetFruitsWithPopup = () => {
    setTotalFruits(0)
    setShowFruitAdded(true)
    setTimeout(() => setShowFruitAdded(false), 2000) // hide after 2s
  }

  const generateQuestions = async (topicText) => {
    setIsGenerating(true)
    try {
      const response = await fetch('http://localhost:3001/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topicText })
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data.questions);
      setTopic(topicText);
    } catch (error) {
      console.error('Error:', error);
      // Fallback to mock questions if API fails
      const mockQuestions = [
        {
          question: 'What is an important concept?',
          answers: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0
        },
        {
          question: 'Which of these is correct?',
          answers: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
          correctAnswer: 1
        },
        {
          question: 'How does this work?',
          answers: ['Answer A', 'Answer B', 'Answer C', 'Answer D'],
          correctAnswer: 2
        },
        {
          question: 'What is a key principle?',
          answers: ['Principle 1', 'Principle 2', 'Principle 3', 'Principle 4'],
          correctAnswer: 3
        },
        {
          question: 'Why is this important?',
          answers: ['Reason A', 'Reason B', 'Reason C', 'Reason D'],
          correctAnswer: 0
        }
      ];
      setQuestions(mockQuestions);
      setTopic(topicText);
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTopicSubmit = (topicText) => {
    generateQuestions(topicText)
    // Reset quiz state when starting new test
    setQuizState({
      currentQuestion: 0,
      selectedAnswers: {},
      showResults: false,
      reviewMode: false
    })
  }

  const handlePomodoroComplete = () => {
    setPomodoroCompleted(true)
    setTotalFruits(prev => prev + 10)
  }

  const handleQuizComplete = (percentage) => {
    let reward = 0
    if (percentage >= 90) reward = 20
    else if (percentage >= 80) reward = 10
    else if (percentage >= 70) reward = 5
    
    setTotalFruits(prev => prev + reward)
  }

  const renderContent = () => {
    if (activeTab === 'training') {
      return <PomodoroTimer onComplete={handlePomodoroComplete} isLocked={false} />
    } else if (activeTab === 'test') {
      if (isGenerating) {
        return (
          <div className="quiz-card">
            <div className="loading">Loading test...
              Please wait...</div>
          </div>
        )
      }
      
      if (!topic || questions.length === 0) {
        return <TopicInput onTopicSubmit={handleTopicSubmit} />
      }
      
      return (
        <Quiz 
          questions={questions} 
          onComplete={handleQuizComplete}
          isLocked={!pomodoroCompleted}
          onNewTest={() => {
            setTopic('')
            setQuestions([])
            setQuizState({
              currentQuestion: 0,
              selectedAnswers: {},
              showResults: false,
              reviewMode: false
            })
          }}
          quizState={quizState}
          setQuizState={setQuizState}
        />
      )
    } else if (activeTab === 'quest') {
      return (
        <div className="quest-placeholder">
          <QuestGame fruitCount={totalFruits} resetFruits={resetFruitsWithPopup}/>
        </div>
      )
    }
  }
  
  return (
    <div className="app">
      {showFruitAdded && <FruitAddedToast />}
      <img src="/img/maincharacter1.png" className="decoration character1" alt="character" />
      <img src="/img/maincharacter2.png" className="decoration character2" alt="character" />
      <img src="/img/bunnyEnemy.png" className="decoration bunny" alt="bunny" />
      <img src="/img/chameleon enemy.png" className="decoration chameleon" alt="chameleon" />
      <img src="/img/MushroomEnemy.png" className="decoration mushroom" alt="mushroom" />
      <img src="/img/trunkEnemy.png" className="decoration trunk" alt="trunk" />
      <img src="/img/TerrainBox1.png" className="decoration box1" alt="box" />
      <img src="/img/TerrainBox3.png" className="decoration box2" alt="box" />
      <img src="/img/TerrainBox3.png" className="decoration box3" alt="box" />
      <img src="/img/TerrainBox4.png" className="decoration box4" alt="box" />
      <img src="/img/TerrainBox1.png" className="decoration box5" alt="box" />
      <img src="/img/TerrainBox2.png" className="decoration box6" alt="box" />
      <img src="/img/TerrainBox1.png" className="decoration box7" alt="box" />
      <img src="/img/TerrainBox4.png" className="decoration box8" alt="box" />
      <img src="/img/TerrainBox3.png" className="decoration box9" alt="box" />
      <img src="/img/TerrainBox2.png" className="decoration box10" alt="box" />
      <img src="/img/TerrainBox1.png" className="decoration box11" alt="box" />
      <img src="/img/TerrainBox4.png" className="decoration box12" alt="box" />
      
      <header className="app-header">
        <FruitCounter totalFruits={totalFruits} />
      </header>

      <main className="app-main">
        <div className="center-container">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'training' ? 'active' : ''}`}
              onClick={() => setActiveTab('training')}
            >
              ⏰ Train
            </button>
            <button 
              className={`tab-button ${activeTab === 'test' ? 'active' : ''}`}
              onClick={() => setActiveTab('test')}
            >
              📝 Test
            </button>
            <button 
              className={`tab-button ${activeTab === 'quest' ? 'active' : ''}`}
              onClick={() => setActiveTab('quest')}
            >
              🎮 Quest!
            </button>
          </div>

          <div className="main-card">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  )
}
function FruitAddedToast() {
  return (
    <div className="fruit-toast">
      ✅ Fruit added!
    </div>
  )
}
export default App
