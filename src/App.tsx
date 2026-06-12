import { useState, useMemo, useEffect } from 'react'
import { 
  BookOpen, 
  Cpu, 
  Users, 
  PenTool, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  ShieldCheck, 
  Layers, 
  Scale, 
  BrainCircuit,
  MessageSquare,
  Star,
  ChevronRight,
  Info
} from 'lucide-react'
import confetti from 'canvas-confetti'

// Interfaces
interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  taxonomy: string
  explanation: string
}

interface AppliedScenario {
  title: string
  desc: string
  challenge: string
  choices: {
    text: string
    score: number
  }[]
  prompt: string
}

// Static Data
const AGE_GROUPS = [
  { id: '6-10', title: 'Age 6-10', subtitle: 'Building Foundations' },
  { id: '11-14', title: 'Age 11-14', subtitle: 'Developing Competencies' },
  { id: '15-18', title: 'Age 15-18', subtitle: 'Preparing Future Leaders' }
]

const EDU_CONTEXTS = [
  { id: 'finland', title: 'Finland', subtitle: 'Competency & Trust' },
  { id: 'singapore', title: 'Singapore', subtitle: 'SkillsFuture & Tech' },
  { id: 'ib', title: 'IB Model', subtitle: 'Holistic Synthesis' },
  { id: 'sdg4', title: 'UN SDG 4', subtitle: 'Equitable & Inclusive' }
]

const QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  '6-10': [
    {
      question: "You notice that a plant near a window bends and grows towards the sunlight outside. Why does it do this?",
      options: [
        "It wants to see the outside garden.",
        "It is trying to get closer to the warm glass.",
        "It is seeking light to perform photosynthesis and make its own food.",
        "It is trying to escape the dark room."
      ],
      correctIndex: 2,
      taxonomy: "Level 2: Conceptual Understanding",
      explanation: "Plants exhibit phototropism—growing towards light sources—because light is essential for them to create glucose (energy) via photosynthesis."
    },
    {
      question: "If you leave a shallow cup of water out in the hot sun, the water level goes down after a few hours. What happened?",
      options: [
        "The sun drank the water directly.",
        "The liquid water evaporated, changing into an invisible gas called water vapor.",
        "The water shrank because of the heat.",
        "The cup leaked or absorbed the water."
      ],
      correctIndex: 1,
      taxonomy: "Level 1: Basic Observation",
      explanation: "Liquid water absorbs heat energy from the sun and undergoes evaporation, transitioning from a liquid state to a gaseous state (water vapor) in the air."
    }
  ],
  '11-14': [
    {
      question: "You are designing a solar-powered toy car. If you connect two solar panels in series instead of parallel, what happens to the electrical circuit?",
      options: [
        "The total power output is cut in half.",
        "The voltage increases while current stays the same, boosting motor speed.",
        "The current increases while voltage stays the same, boosting battery capacity.",
        "The circuit short-circuits and burns out."
      ],
      correctIndex: 1,
      taxonomy: "Level 3: Applied Reasoning",
      explanation: "Connecting energy sources in series adds their voltages together (V_total = V1 + V2) while current remains constant, which increases the motor's speed."
    },
    {
      question: "In a forest ecosystem, if a disease kills off almost all the wolves (top predators), what is the most likely chain reaction?",
      options: [
        "Other predators will immediately move in and balance the ecosystem.",
        "Herbivore populations (like deer) will explode, leading to overgrazing and soil erosion.",
        "Plant life will grow twice as dense because there are fewer animals running around.",
        "The herbivores will stop reproducing because they are no longer scared."
      ],
      correctIndex: 1,
      taxonomy: "Level 4: Systems Analysis",
      explanation: "This is a trophic cascade. Without a key predator, herbivore populations grow unchecked, consuming too much plant life, which degrades the soil and habitat for other species."
    }
  ],
  '15-18': [
    {
      question: "A municipality wants to reduce its carbon footprint. It can invest in Lithium-ion batteries or Hydrogen Fuel cells. Which is best suited for seasonal (long-term) grid energy storage?",
      options: [
        "Flywheels, because they retain rotational energy with zero frictional losses.",
        "Lithium-ion batteries, due to their low self-discharge rates over months.",
        "Hydrogen storage, because hydrogen gas can be stored indefinitely without charge leakage.",
        "Both technologies perform identically for seasonal storage timescales."
      ],
      correctIndex: 2,
      taxonomy: "Level 5: Critical Synthesis",
      explanation: "Hydrogen storage is ideal for long-term seasonal storage because hydrogen can be stored in large geological caverns or tanks without losing charge over time, whereas batteries leak charge and have high capital costs for long-term standby capacity."
    },
    {
      question: "When implementing environmental policies, what is the primary economic trade-off between a Carbon Tax and a Cap-and-Trade system?",
      options: [
        "Carbon taxes provide price certainty but quantity uncertainty; Cap-and-Trade provides quantity certainty but price uncertainty.",
        "Carbon taxes provide quantity certainty; Cap-and-Trade provides price certainty.",
        "Carbon taxes only affect consumers, while Cap-and-Trade only affects large factories.",
        "There is no economic difference; both systems produce identical outcomes."
      ],
      correctIndex: 0,
      taxonomy: "Level 6: Policy Evaluation",
      explanation: "A carbon tax sets a fixed price on carbon (certain price) but emissions levels can vary (uncertain quantity). Cap-and-Trade caps the quantity of emissions (certain quantity) but permit market prices fluctuate (uncertain price)."
    }
  ]
}

const APPLIED_SCENARIOS: Record<string, AppliedScenario> = {
  '6-10': {
    title: "The Plastic Waste Crisis",
    desc: "Your school canteen is throwing away hundreds of single-use plastic cups every single day, filling up landfills and harming wildlife.",
    challenge: "Goal: Propose a plan to reduce plastic waste and make students excited to recycle.",
    choices: [
      { text: "Make a rule banning plastic cups immediately and punish students who bring them.", score: 10 },
      { text: "Create posters and give students house points for bringing reusable water bottles.", score: 30 },
      { text: "Set up color-coded bins, but let students keep throwing things away as usual.", score: 20 }
    ],
    prompt: "Write a short paragraph explaining how you would convince your classmates to recycle their cups."
  },
  '11-14': {
    title: "School Energy Conservation Project",
    desc: "Your school wants to reduce its electricity usage by 20% to cut costs and lower carbon emissions. The principal wants to see a student plan.",
    challenge: "Goal: Design a strategy to optimize lighting, heating/cooling, and student behaviors.",
    choices: [
      { text: "Turn off all heaters and air conditioners completely, regardless of the weather.", score: 10 },
      { text: "Install smart occupancy sensors, swap bulbs for LEDs, and run a peer 'energy audit' team.", score: 30 },
      { text: "Replace all windows with double-pane glass, even though it costs more than the school budget.", score: 22 }
    ],
    prompt: "Describe how you will measure and prove that your energy-saving ideas are actually working over a 3-month period."
  },
  '15-18': {
    title: "Community Clean Energy Transition",
    desc: "A low-income neighborhood is experiencing high air pollution from a nearby coal plant. The city wants to transition local homes to renewable energy.",
    challenge: "Goal: Address the high upfront capital costs and ensure the transition is equitable and socially inclusive.",
    choices: [
      { text: "Pass a law forcing all landlords to install solar panels immediately or pay massive fines.", score: 12 },
      { text: "Create a community solar cooperative financed by municipal green bonds, offering subsidized clean energy rates.", score: 30 },
      { text: "Build a small nuclear micro-reactor in the local park without public consultation.", score: 20 }
    ],
    prompt: "Detail how you will address the financial barriers of solar installations for low-income tenants who do not own their roofs."
  }
}

const PEERS = [
  { name: "Maya", role: "Researcher", defaultStatus: "Waiting for instructions" },
  { name: "Dev", role: "Designer", defaultStatus: "Waiting for instructions" },
  { name: "Chloe", role: "Presenter", defaultStatus: "Waiting for instructions" }
]

const CONFLICT_SCENARIOS = {
  '6-10': {
    question: "Maya is upset because Dev isn't drawing the pictures for the poster. What do you do?",
    choices: [
      { text: "Tell the teacher and get Dev in trouble.", score: 10 },
      { text: "Have a friendly team meeting to ask Dev if he needs help drawing.", score: 20 },
      { text: "Ignore them and do all the drawings yourself.", score: 12 }
    ]
  },
  '11-14': {
    question: "Dev is behind on his slides because he has a soccer match, and Chloe is frustrated about the delay. What do you do?",
    choices: [
      { text: "Demand Dev works late night to finish, or remove his name from the project.", score: 10 },
      { text: "Hold a team call, reallocate some slides to Chloe and Maya, and adjust the timeline.", score: 20 },
      { text: "Do Dev's work secretly so no one argues.", score: 14 }
    ]
  },
  '15-18': {
    question: "Maya wants to use quantitative data from an API, but Chloe thinks qualitative interviews are more convincing for the presentation. They are stuck in a deadlock.",
    choices: [
      { text: "Vote as a team to pick one method and completely discard the other.", score: 12 },
      { text: "Synthesize both: use Maya's data for the charts, and Chloe's quotes as case study highlights.", score: 20 },
      { text: "Let the team leader make the decision unilaterally without discussion.", score: 14 }
    ]
  }
}

export default function App() {
  // Setup State
  const [hasSetup, setHasSetup] = useState<boolean>(false)
  const [userName, setUserName] = useState<string>("")
  const [ageGroup, setAgeGroup] = useState<string>("15-18")
  const [eduContext, setEduContext] = useState<string>("finland")

  // Dimension Scores (Weighted)
  const [foundationalScore, setFoundationalScore] = useState<number>(0) // Out of 40
  const [appliedScore, setAppliedScore] = useState<number>(0)           // Out of 30
  const [collaborativeScore, setCollaborativeScore] = useState<number>(0) // Out of 20
  const [reflectiveScore, setReflectiveScore] = useState<number>(0)       // Out of 10

  // UI state
  const [activeTab, setActiveTab] = useState<string>("foundational")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Module 1: Foundational Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [quizLocked, setQuizLocked] = useState<boolean>(false)

  // Module 2: Applied Scenario State
  const [appliedChoice, setAppliedChoice] = useState<number>(-1)
  const [appliedText, setAppliedText] = useState<string>("")
  const [appliedSubmitted, setAppliedSubmitted] = useState<boolean>(false)
  const [appliedEval, setAppliedEval] = useState<{
    problemSolving: number
    practicalApp: number
    criticalThink: number
    feedback: string
  } | null>(null)

  // Module 3: Collaborative Synthesis State
  const [delegations, setDelegations] = useState<Record<string, string>>({})
  const [conflictChoice, setConflictChoice] = useState<number>(-1)
  const [peerRatings, setPeerRatings] = useState<Record<string, number>>({})
  const [collabSubmitted, setCollabSubmitted] = useState<boolean>(false)

  // Module 4: Reflective Metacognition State
  const [journalText, setJournalText] = useState<string>("")
  const [reflectiveSubmitted, setReflectiveSubmitted] = useState<boolean>(false)
  const [learningSignature, setLearningSignature] = useState<{
    type: string
    description: string
    conceptual: number
    pragmatic: number
    collaborative: number
  } | null>(null)

  // Show Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Calculate Weighted Aggregate Score
  const totalMasteryScore = useMemo(() => {
    return Math.round(foundationalScore + appliedScore + collaborativeScore + reflectiveScore)
  }, [foundationalScore, appliedScore, collaborativeScore, reflectiveScore])

  // Context-based advice
  const contextAdvice = useMemo(() => {
    switch(eduContext) {
      case 'finland':
        return {
          title: "Finnish Model Focus",
          tagline: "Autonomous trust, self-reflection, and critical reasoning over standard metrics."
        }
      case 'singapore':
        return {
          title: "Singapore SkillsFuture Focus",
          tagline: "Functional industry alignment, real-world application, and structured problem-solving."
        }
      case 'ib':
        return {
          title: "IB Mastery Focus",
          tagline: "Global-minded synthesis, interdisciplinary connections, and active peer-review."
        }
      case 'sdg4':
        return {
          title: "UN SDG 4 Focus",
          tagline: "Equitable contribution, sustainability impact, and ethical problem solving."
        }
      default:
        return { title: "", tagline: "" }
    }
  }, [eduContext])

  // Ripple Effect status
  const rippleNodes = useMemo(() => {
    const isFoundationalDone = foundationalScore > 0
    const isAppliedDone = appliedScore > 0
    const isCollabDone = collaborativeScore > 0
    const isReflectiveDone = reflectiveScore > 0

    return [
      { id: 1, label: "Competency Assessment", active: true },
      { id: 2, label: "Engaged Learners", active: isFoundationalDone },
      { id: 3, label: "Skilled Graduates", active: isFoundationalDone && isAppliedDone },
      { id: 4, label: "Innovative Workforce", active: isFoundationalDone && isAppliedDone && isCollabDone },
      { id: 5, label: "Resilient Societies", active: isFoundationalDone && isAppliedDone && isCollabDone && isReflectiveDone }
    ]
  }, [foundationalScore, appliedScore, collaborativeScore, reflectiveScore])

  // Anxiety Index (visualizes stress drops as they gain confidence)
  const anxietyIndex = useMemo(() => {
    let index = 90
    if (foundationalScore > 0) index -= 20
    if (appliedScore > 0) index -= 25
    if (collaborativeScore > 0) index -= 20
    if (reflectiveScore > 0) index -= 15
    return Math.max(10, index)
  }, [foundationalScore, appliedScore, collaborativeScore, reflectiveScore])

  // Trigger celebration on completing all modules
  useEffect(() => {
    if (hasSetup && totalMasteryScore >= 95) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      })
    }
  }, [totalMasteryScore, hasSetup])

  // Form Submission
  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim()) {
      triggerToast("Please enter a name to configure your profile.")
      return
    }
    setHasSetup(true)
    triggerToast(`Welcome ${userName}! SPARK Portal loaded with ${AGE_GROUPS.find(a => a.id === ageGroup)?.title} framework.`)
  }

  // Reset Assessment State
  const handleResetProfile = () => {
    setHasSetup(false)
    setUserName("")
    setFoundationalScore(0)
    setAppliedScore(0)
    setCollaborativeScore(0)
    setReflectiveScore(0)
    setCurrentQuizIndex(0)
    setSelectedAnswers({})
    setQuizLocked(false)
    setAppliedChoice(-1)
    setAppliedText("")
    setAppliedSubmitted(false)
    setAppliedEval(null)
    setDelegations({})
    setConflictChoice(-1)
    setPeerRatings({})
    setCollabSubmitted(false)
    setJournalText("")
    setReflectiveSubmitted(false)
    setLearningSignature(null)
    setActiveTab("foundational")
  }

  // MODULE 1: QUIZ ACTIONS
  const handleSelectQuizAnswer = (optionIdx: number) => {
    if (quizLocked) return
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuizIndex]: optionIdx
    })
  }

  const handleNextQuizQuestion = () => {
    const questions = QUIZ_QUESTIONS[ageGroup]
    if (currentQuizIndex < questions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1)
    } else {
      // Finalize Quiz Score
      let correctCount = 0
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          correctCount++
        }
      })
      const finalVal = (correctCount / questions.length) * 40
      setFoundationalScore(finalVal)
      setQuizLocked(true)
      triggerToast(`Conceptual Quiz complete! Foundational score: ${Math.round(finalVal)}% of 40%`)
      confetti({ particleCount: 30, spread: 45 })
    }
  }

  // MODULE 2: APPLIED SCENARIO ACTIONS
  const handleSelectAppliedChoice = (choiceIdx: number) => {
    if (appliedSubmitted) return
    setAppliedChoice(choiceIdx)
  }

  const handleEvaluateApplied = () => {
    if (appliedChoice === -1) {
      triggerToast("Please select a strategic direction first.")
      return
    }
    if (appliedText.trim().length < 20) {
      triggerToast("Please write a detailed response (at least 20 characters) for a realistic evaluation.")
      return
    }

    // Evaluate response based on keywords and lengths
    const wordCount = appliedText.trim().split(/\s+/).length
    const cleanText = appliedText.toLowerCase()
    
    let criticalKeywords = 0
    const keywords = ['social', 'cost', 'measure', 'cooperative', 'community', 'local', 'feedback', 'budget', 'solar', 'sensor', 'recycle', 'reduce', 'green']
    keywords.forEach(word => {
      if (cleanText.includes(word)) criticalKeywords++
    })

    // Scores (base from strategic choice + essay analysis)
    const baseChoiceScore = APPLIED_SCENARIOS[ageGroup].choices[appliedChoice].score
    const essayBonus = Math.min(10, Math.floor(wordCount / 10) + criticalKeywords)
    
    const problemSolving = Math.min(10, Math.round((baseChoiceScore / 30) * 8 + (essayBonus > 5 ? 2 : 1)))
    const practicalApp = Math.min(10, Math.round((baseChoiceScore / 30) * 7 + (wordCount > 25 ? 3 : 1)))
    const criticalThink = Math.min(10, Math.round(5 + criticalKeywords))

    const calculatedWeight = Math.round(((problemSolving + practicalApp + criticalThink) / 30) * 30)
    
    let feedback = ""
    if (calculatedWeight >= 25) {
      feedback = "Outstanding application of concept! Your response highlights a systemic view of the problem, addressing financial hurdles, measuring results, and incorporating stakeholders equitably."
    } else if (calculatedWeight >= 18) {
      feedback = "Good practical approach. Your plan works well, but could benefit from a more concrete way to measure success and engage local community members in decision-making."
    } else {
      feedback = "A basic solution. To improve, ensure you build concrete tracking mechanisms and address critical upfront financial or social barriers."
    }

    setAppliedScore(calculatedWeight)
    setAppliedEval({
      problemSolving,
      practicalApp,
      criticalThink,
      feedback
    })
    setAppliedSubmitted(true)
    triggerToast(`Applied Competency assessment finished! Score: ${calculatedWeight}% of 30%`)
    confetti({ particleCount: 30, spread: 45 })
  }

  // MODULE 3: COLLABORATIVE ACTIONS
  const handleAssignRole = (peerName: string, role: string) => {
    if (collabSubmitted) return
    setDelegations({
      ...delegations,
      [peerName]: role
    })
  }

  const handleSelectConflictChoice = (choiceIdx: number) => {
    if (collabSubmitted) return
    setConflictChoice(choiceIdx)
  }

  const handleRatePeer = (peerName: string, rating: number) => {
    if (collabSubmitted) return
    setPeerRatings({
      ...peerRatings,
      [peerName]: rating
    })
  }

  const handleEvaluateCollaboration = () => {
    // Check constraints
    const uniqueDelegatedRoles = new Set(Object.values(delegations))
    if (Object.keys(delegations).length < PEERS.length || uniqueDelegatedRoles.size < PEERS.length) {
      triggerToast("Please delegate a unique project role to each virtual classmate.")
      return
    }
    if (conflictChoice === -1) {
      triggerToast("Please choose a conflict resolution strategy.")
      return
    }
    if (Object.keys(peerRatings).length < PEERS.length) {
      triggerToast("Please complete the peer feedback ratings.")
      return
    }

    // Score synthesis
    const conflictScoreVal = CONFLICT_SCENARIOS[ageGroup as keyof typeof CONFLICT_SCENARIOS].choices[conflictChoice].score
    // Avg rating provided determines collaboration score
    const totalProvidedRating = Object.values(peerRatings).reduce((a, b) => a + b, 0)
    const ratingBonus = totalProvidedRating >= 12 ? 10 : 8 // rewarding encouraging ratings

    const finalVal = Math.round((conflictScoreVal / 20) * 10 + ratingBonus)
    setCollaborativeScore(finalVal)
    setCollabSubmitted(true)
    triggerToast(`Collaboration index logged! Score: ${finalVal}% of 20%`)
    confetti({ particleCount: 30, spread: 45 })
  }

  // MODULE 4: REFLECTIVE JOURNAL ACTIONS
  const handleEvaluateReflection = () => {
    if (journalText.trim().length < 30) {
      triggerToast("Please write a meaningful reflection (at least 30 characters) to analyze growth.")
      return
    }

    const cleanText = journalText.toLowerCase()
    const wordCount = journalText.trim().split(/\s+/).length

    // Categorization rules
    let analyticalWords = 0
    let collaborativeWords = 0
    let actionWords = 0

    const analyticalKeywords = ['understand', 'logic', 'analyze', 'learned', 'mistake', 'why', 'compare', 'concept', 'question']
    const collabKeywords = ['team', 'together', 'share', 'conflict', 'listen', 'support', 'group', 'peer', 'collaboration']
    const actionKeywords = ['build', 'try', 'do', 'design', 'make', 'apply', 'test', 'create', 'solve', 'energy', 'solution']

    analyticalKeywords.forEach(w => { if (cleanText.includes(w)) analyticalWords++ })
    collabKeywords.forEach(w => { if (cleanText.includes(w)) collaborativeWords++ })
    actionKeywords.forEach(w => { if (cleanText.includes(w)) actionWords++ })

    let type = "Reflective Analyst"
    let description = "You focus heavily on conceptual accuracy, tracing mistakes back to logic gaps, and organizing knowledge frameworks. You prefer to understand the root cause before moving to execution."
    let conceptual = 10, pragmatic = 6, collaborative = 6

    if (collaborativeWords > analyticalWords && collaborativeWords > actionWords) {
      type = "Empathetic Synthesizer"
      description = "Your primary pathway is through the team. You view problem solving as a social activity, highly valuing peer review, shared workloads, and communicative alignment."
      conceptual = 6; pragmatic = 7; collaborative = 10
    } else if (actionWords > analyticalWords && actionWords > collaborativeWords) {
      type = "Pragmatic Innovator"
      description = "You learn by doing. Your reflections focus on active design, practical application, testing parameters, and building concrete prototypes. Rote recall feels static to you."
      conceptual = 7; pragmatic = 10; collaborative = 6
    } else {
      // Balanced
      type = "Integrated Mastery Architect"
      description = "You demonstrate a balanced cognitive loop, successfully bridging conceptual knowledge (know), hands-on application (apply), and collaborative feedback."
      conceptual = 9; pragmatic = 9; collaborative = 8
    }

    // Award score out of 10
    const finalScore = Math.min(10, Math.round(6 + (wordCount > 40 ? 2 : 1) + Math.min(2, Math.max(1, analyticalWords + collaborativeWords + actionWords) / 2)))
    setReflectiveScore(finalScore)
    setLearningSignature({
      type,
      description,
      conceptual,
      pragmatic,
      collaborative
    })
    setReflectiveSubmitted(true)
    triggerToast(`Journal analyzed! Learning signature: "${type}" unlocked.`)
    confetti({ particleCount: 50, spread: 60 })
  }

  // Mastery wheel stroke arrays (based on weights 40, 30, 20, 10)
  // Circumference of radius 90 is 2 * Math.PI * 90 = 565.48
  const radius = 90
  const circ = 2 * Math.PI * radius // ~565.48
  
  // Weights: Foundational=40%, Applied=30%, Collaborative=20%, Reflective=10%
  // Segment lengths: 
  // F: 40% of circ = 226.19
  // A: 30% of circ = 169.64
  // C: 20% of circ = 113.10
  // R: 10% of circ = 56.55
  const segmentLengths = {
    foundational: circ * 0.4,
    applied: circ * 0.3,
    collaborative: circ * 0.2,
    reflective: circ * 0.1
  }

  // Current filled values based on student scores
  // E.g. if foundationalScore is 20 (which is 50% of 40), fill value is 50% of F's length
  const strokeFills = {
    foundational: (foundationalScore / 40) * segmentLengths.foundational,
    applied: (appliedScore / 30) * segmentLengths.applied,
    collaborative: (collaborativeScore / 20) * segmentLengths.collaborative,
    reflective: (reflectiveScore / 10) * segmentLengths.reflective
  }

  return (
    <div id="app-root">
      {toastMessage && (
        <div className="setup-overlay" style={{ background: 'transparent', pointerEvents: 'none', zIndex: 1100 }}>
          <div className="glass-panel fade-in" style={{
            background: 'rgba(18, 20, 32, 0.95)',
            borderColor: 'var(--color-collaborative)',
            padding: '1rem 2rem',
            borderRadius: '9999px',
            boxShadow: '0 0 25px rgba(139, 92, 246, 0.4)',
            maxWidth: '450px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            pointerEvents: 'auto'
          }}>
            <Sparkles size={20} color="#c084fc" />
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>{toastMessage}</p>
          </div>
        </div>
      )}

      {/* SETUP CONFIGURATION OVERLAY */}
      {!hasSetup && (
        <div className="setup-overlay">
          <div className="setup-card fade-in">
            <div className="brand" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
              <div className="brand-logo">S</div>
              <div>
                <h2 className="brand-title" style={{ margin: 0 }}>SPARK</h2>
                <div className="brand-tagline">EdAssist Framework</div>
              </div>
            </div>
            <h1 className="setup-title gradient-text">Reimagine Assessments</h1>
            <p className="setup-description">
              Step away from rote memorization. Define your profile to test your capabilities in concept analytics, real-world application, teamwork, and metacognition.
            </p>
            
            <form onSubmit={handleSetupSubmit} className="setup-form">
              <div className="form-group">
                <label>Student Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Alex Rivera" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Age & Implementation Stage</label>
                <div className="option-grid">
                  {AGE_GROUPS.map(age => (
                    <div 
                      key={age.id} 
                      className={`option-card ${ageGroup === age.id ? 'selected' : ''}`}
                      onClick={() => setAgeGroup(age.id)}
                    >
                      <span className="option-title">{age.title}</span>
                      <span className="option-subtitle">{age.subtitle}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Global Educational Context</label>
                <div className="option-grid four-cols">
                  {EDU_CONTEXTS.map(ctx => (
                    <div 
                      key={ctx.id} 
                      className={`option-card ${eduContext === ctx.id ? 'selected' : ''}`}
                      onClick={() => setEduContext(ctx.id)}
                    >
                      <span className="option-title">{ctx.title}</span>
                      <span className="option-subtitle">{ctx.subtitle}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="pill-button primary" style={{ width: '100%', padding: '0.85rem', marginTop: '1rem', justifyContent: 'center' }}>
                <Sparkles size={16} /> Configure Assessment Environment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      {hasSetup && (
        <>
          <header className="app-header">
            <div className="brand">
              <div className="brand-logo">S</div>
              <div>
                <h1 className="brand-title" style={{ fontSize: '1.25rem', margin: 0 }}>SPARK</h1>
                <div className="brand-tagline">Assessment Portal</div>
              </div>
            </div>
            
            <div className="header-controls">
              <div className="pill-button" style={{ pointerEvents: 'none', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                <Globe size={14} color="#10b981" />
                <span style={{ color: '#34d399' }}>{contextAdvice.title}</span>
              </div>
              <button className="pill-button" onClick={handleResetProfile}>
                <RefreshCw size={14} /> Reconfigure Environment
              </button>
            </div>
          </header>

          {/* MAIN CONTAINER */}
          <main className="dashboard-container">
            
            {/* SIDEBAR: MASTERY WHEEL & PROFILE */}
            <div className="sidebar">
              
              {/* Profile card */}
              <div className="glass-panel profile-summary">
                <div className="avatar">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h3 style={{ margin: 0 }}>{userName}</h3>
                  <div className="profile-badge">{AGE_GROUPS.find(a => a.id === ageGroup)?.title}</div>
                  <div className="profile-badge" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#c084fc' }}>{EDU_CONTEXTS.find(c => c.id === eduContext)?.title} Model</div>
                </div>
              </div>

              {/* Tri-Dimensional Mastery Wheel */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Mastery Framework</h3>
                
                <div className="wheel-container">
                  <svg className="mastery-svg">
                    {/* Background segments */}
                    {/* Foundational: 40% (Starts at 0, length ~226.2) */}
                    <circle 
                      cx="120" cy="120" r={radius} 
                      fill="none" 
                      stroke="rgba(255,255,255,0.03)" 
                      strokeWidth="16" 
                      strokeDasharray={`${segmentLengths.foundational} ${circ - segmentLengths.foundational}`}
                      strokeDashoffset="0"
                    />
                    {/* Applied: 30% (Starts after F, offset -226.2, length ~169.6) */}
                    <circle 
                      cx="120" cy="120" r={radius} 
                      fill="none" 
                      stroke="rgba(255,255,255,0.03)" 
                      strokeWidth="16" 
                      strokeDasharray={`${segmentLengths.applied} ${circ - segmentLengths.applied}`}
                      strokeDashoffset={-segmentLengths.foundational}
                    />
                    {/* Collaborative: 20% (Starts after F+A, offset -395.8, length ~113.1) */}
                    <circle 
                      cx="120" cy="120" r={radius} 
                      fill="none" 
                      stroke="rgba(255,255,255,0.03)" 
                      strokeWidth="16" 
                      strokeDasharray={`${segmentLengths.collaborative} ${circ - segmentLengths.collaborative}`}
                      strokeDashoffset={-(segmentLengths.foundational + segmentLengths.applied)}
                    />
                    {/* Reflective: 10% (Starts after F+A+C, offset -508.9, length ~56.5) */}
                    <circle 
                      cx="120" cy="120" r={radius} 
                      fill="none" 
                      stroke="rgba(255,255,255,0.03)" 
                      strokeWidth="16" 
                      strokeDasharray={`${segmentLengths.reflective} ${circ - segmentLengths.reflective}`}
                      strokeDashoffset={-(segmentLengths.foundational + segmentLengths.applied + segmentLengths.collaborative)}
                    />

                    {/* Active filled segments */}
                    {/* Foundational (Blue) */}
                    <circle 
                      cx="120" cy="120" r={radius} 
                      fill="none" 
                      stroke="var(--color-foundational)" 
                      strokeWidth="16" 
                      strokeLinecap="round"
                      strokeDasharray={`${strokeFills.foundational} ${circ - strokeFills.foundational}`}
                      strokeDashoffset="0"
                      style={{ transition: 'stroke-dasharray 0.5s ease', filter: 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.4))' }}
                    />
                    {/* Applied (Green) */}
                    <circle 
                      cx="120" cy="120" r={radius} 
                      fill="none" 
                      stroke="var(--color-applied)" 
                      strokeWidth="16" 
                      strokeLinecap="round"
                      strokeDasharray={`${strokeFills.applied} ${circ - strokeFills.applied}`}
                      strokeDashoffset={-segmentLengths.foundational}
                      style={{ transition: 'stroke-dasharray 0.5s ease', filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.4))' }}
                    />
                    {/* Collaborative (Purple) */}
                    <circle 
                      cx="120" cy="120" r={radius} 
                      fill="none" 
                      stroke="var(--color-collaborative)" 
                      strokeWidth="16" 
                      strokeLinecap="round"
                      strokeDasharray={`${strokeFills.collaborative} ${circ - strokeFills.collaborative}`}
                      strokeDashoffset={-(segmentLengths.foundational + segmentLengths.applied)}
                      style={{ transition: 'stroke-dasharray 0.5s ease', filter: 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.4))' }}
                    />
                    {/* Reflective (Amber) */}
                    <circle 
                      cx="120" cy="120" r={radius} 
                      fill="none" 
                      stroke="var(--color-reflective)" 
                      strokeWidth="16" 
                      strokeLinecap="round"
                      strokeDasharray={`${strokeFills.reflective} ${circ - strokeFills.reflective}`}
                      strokeDashoffset={-(segmentLengths.foundational + segmentLengths.applied + segmentLengths.collaborative)}
                      style={{ transition: 'stroke-dasharray 0.5s ease', filter: 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.4))' }}
                    />
                  </svg>
                  
                  <div className="wheel-center-content">
                    <div className="wheel-score">{totalMasteryScore}</div>
                    <div className="wheel-label">Total Index</div>
                    <div className="wheel-status-indicator">
                      {totalMasteryScore >= 90 ? "Mastery" : totalMasteryScore >= 60 ? "Proficient" : "Developing"}
                    </div>
                  </div>
                </div>

                <div className="dimension-list">
                  <div className={`dimension-item ${activeTab === 'foundational' ? 'active' : ''}`} onClick={() => setActiveTab('foundational')}>
                    <div className="dimension-meta">
                      <div className="dimension-dot" style={{ backgroundColor: 'var(--color-foundational)' }}></div>
                      <span className="dimension-title">Foundational <span className="dimension-weight">(40%)</span></span>
                    </div>
                    <div className="dimension-progress">
                      <span>{Math.round(foundationalScore)}%</span>
                      <div className="dimension-prog-bar">
                        <div className="dimension-prog-fill" style={{ width: `${(foundationalScore/40)*100}%`, backgroundColor: 'var(--color-foundational)' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className={`dimension-item ${activeTab === 'applied' ? 'active' : ''}`} onClick={() => setActiveTab('applied')}>
                    <div className="dimension-meta">
                      <div className="dimension-dot" style={{ backgroundColor: 'var(--color-applied)' }}></div>
                      <span className="dimension-title">Applied <span className="dimension-weight">(30%)</span></span>
                    </div>
                    <div className="dimension-progress">
                      <span>{Math.round(appliedScore)}%</span>
                      <div className="dimension-prog-bar">
                        <div className="dimension-prog-fill" style={{ width: `${(appliedScore/30)*100}%`, backgroundColor: 'var(--color-applied)' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className={`dimension-item ${activeTab === 'collaborative' ? 'active' : ''}`} onClick={() => setActiveTab('collaborative')}>
                    <div className="dimension-meta">
                      <div className="dimension-dot" style={{ backgroundColor: 'var(--color-collaborative)' }}></div>
                      <span className="dimension-title">Collaborative <span className="dimension-weight">(20%)</span></span>
                    </div>
                    <div className="dimension-progress">
                      <span>{Math.round(collaborativeScore)}%</span>
                      <div className="dimension-prog-bar">
                        <div className="dimension-prog-fill" style={{ width: `${(collaborativeScore/20)*100}%`, backgroundColor: 'var(--color-collaborative)' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className={`dimension-item ${activeTab === 'reflective' ? 'active' : ''}`} onClick={() => setActiveTab('reflective')}>
                    <div className="dimension-meta">
                      <div className="dimension-dot" style={{ backgroundColor: 'var(--color-reflective)' }}></div>
                      <span className="dimension-title">Reflective <span className="dimension-weight">(10%)</span></span>
                    </div>
                    <div className="dimension-progress">
                      <span>{Math.round(reflectiveScore)}%</span>
                      <div className="dimension-prog-bar">
                        <div className="dimension-prog-fill" style={{ width: `${(reflectiveScore/10)*100}%`, backgroundColor: 'var(--color-reflective)' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Context Model Card */}
              <div className="glass-panel" style={{ borderLeft: '3px solid var(--color-applied)' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '0.25rem' }}>{contextAdvice.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {contextAdvice.tagline}
                </p>
              </div>
            </div>

            {/* MAIN PORTAL AREA */}
            <div className="main-content">
              
              {/* TAB SELECTOR */}
              <nav className="tabs-navigation">
                <button 
                  className={`tab-btn foundational ${activeTab === 'foundational' ? 'active' : ''}`}
                  onClick={() => setActiveTab('foundational')}
                >
                  <BookOpen size={16} />
                  <span>Foundational (40%)</span>
                </button>
                
                <button 
                  className={`tab-btn applied ${activeTab === 'applied' ? 'active' : ''}`}
                  onClick={() => setActiveTab('applied')}
                >
                  <Cpu size={16} />
                  <span>Applied (30%)</span>
                </button>

                <button 
                  className={`tab-btn collaborative ${activeTab === 'collaborative' ? 'active' : ''}`}
                  onClick={() => setActiveTab('collaborative')}
                >
                  <Users size={16} />
                  <span>Collaborative (20%)</span>
                </button>

                <button 
                  className={`tab-btn reflective ${activeTab === 'reflective' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reflective')}
                >
                  <PenTool size={16} />
                  <span>Reflective (10%)</span>
                </button>
              </nav>

              {/* ACTIVE ASSESSMENT SCREEN */}
              <div className="glass-panel fade-in" style={{ minHeight: '380px' }}>
                
                {/* 1. FOUNDATIONAL ANALYTICS TAB */}
                {activeTab === 'foundational' && (
                  <div className="quiz-container">
                    <div className="assessment-header">
                      <div className="assessment-meta-info">
                        <div className="assessment-badge foundational">
                          <BookOpen size={12} /> Foundational Analytics Assessment
                        </div>
                        <h2 style={{ fontSize: '1.25rem', color: 'white' }}>Bloom's Taxonomy Conceptual Check</h2>
                      </div>
                      <div className="assessment-score-tracker">
                        <div className="score-badge">{Math.round(foundationalScore)} / 40</div>
                        <div className="score-label">Secured Weight</div>
                      </div>
                    </div>

                    {!quizLocked ? (
                      <>
                        <div className="quiz-progress-bar">
                          <div 
                            className="quiz-progress-fill" 
                            style={{ width: `${((currentQuizIndex + 1) / QUIZ_QUESTIONS[ageGroup].length) * 100}%` }}
                          ></div>
                        </div>

                        <div className="quiz-question-box">
                          <div className="quiz-taxonomy-tag">
                            {QUIZ_QUESTIONS[ageGroup][currentQuizIndex].taxonomy}
                          </div>
                          <p className="quiz-question-text">
                            {QUIZ_QUESTIONS[ageGroup][currentQuizIndex].question}
                          </p>
                          
                          <div className="quiz-options-list">
                            {QUIZ_QUESTIONS[ageGroup][currentQuizIndex].options.map((opt, oIdx) => {
                              const isSelected = selectedAnswers[currentQuizIndex] === oIdx
                              return (
                                <button 
                                  key={oIdx} 
                                  className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSelectQuizAnswer(oIdx)}
                                >
                                  <span>{opt}</span>
                                  {isSelected && <Sparkles size={14} color="#60a5fa" />}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="modal-footer-btns">
                          <button 
                            className="modal-btn primary"
                            disabled={selectedAnswers[currentQuizIndex] === undefined}
                            onClick={handleNextQuizQuestion}
                          >
                            <span>
                              {currentQuizIndex === QUIZ_QUESTIONS[ageGroup].length - 1 ? "Complete Quiz" : "Next Question"}
                            </span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <CheckCircle2 size={48} color="#34d399" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem' }}>Quiz Locked</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '450px', marginLeft: 'auto', marginRight: 'auto' }}>
                          You have completed the foundational conceptual check. Your knowledge levels have been updated in the Mastery Wheel.
                        </p>
                        
                        <div className="quiz-options-list" style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
                          {QUIZ_QUESTIONS[ageGroup].map((q, qIdx) => {
                            const ansIdx = selectedAnswers[qIdx]
                            const isCorrect = ansIdx === q.correctIndex
                            return (
                              <div key={qIdx} className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                  <span className="quiz-taxonomy-tag">{q.taxonomy}</span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: isCorrect ? '#34d399' : '#f87171' }}>
                                    {isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                    {isCorrect ? "Correct" : "Incorrect"}
                                  </span>
                                </div>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'white' }}>{q.question}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  <strong>Your Answer:</strong> {q.options[ansIdx]}
                                </p>
                                <div className="explanation-box" style={{ marginTop: '0.5rem' }}>
                                  <strong>Reasoning:</strong> {q.explanation}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. APPLIED COMPETENCY TAB */}
                {activeTab === 'applied' && (
                  <div className="applied-container">
                    <div className="assessment-header">
                      <div className="assessment-meta-info">
                        <div className="assessment-badge applied">
                          <Cpu size={12} /> Applied Competency Simulation
                        </div>
                        <h2 style={{ fontSize: '1.25rem', color: 'white' }}>Authentic Professional Scenario Task</h2>
                      </div>
                      <div className="assessment-score-tracker">
                        <div className="score-badge">{Math.round(appliedScore)} / 30</div>
                        <div className="score-label">Secured Weight</div>
                      </div>
                    </div>

                    {!appliedSubmitted ? (
                      <>
                        <div className="scenario-card">
                          <div className="scenario-title">{APPLIED_SCENARIOS[ageGroup].title}</div>
                          <p className="scenario-desc">{APPLIED_SCENARIOS[ageGroup].desc}</p>
                          <div className="challenge-text">
                            <strong>{APPLIED_SCENARIOS[ageGroup].challenge}</strong>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Step 1: Choose Your Strategic Project Direction</label>
                          <div className="branch-choices-grid">
                            {APPLIED_SCENARIOS[ageGroup].choices.map((choice, cIdx) => (
                              <div 
                                key={cIdx} 
                                className={`branch-choice-card ${appliedChoice === cIdx ? 'selected' : ''}`}
                                onClick={() => handleSelectAppliedChoice(cIdx)}
                              >
                                <div className="branch-num">{cIdx + 1}</div>
                                <div>{choice.text}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="response-area">
                          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Step 2: Propose Your Execution Strategy
                          </label>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            {APPLIED_SCENARIOS[ageGroup].prompt}
                          </p>
                          <textarea 
                            className="response-textarea" 
                            placeholder="Type your strategic proposal here (must be at least 20 characters)..."
                            value={appliedText}
                            onChange={(e) => setAppliedText(e.target.value)}
                          />
                          <div className="response-limit-label">
                            {appliedText.length} characters (Min 20)
                          </div>
                        </div>

                        <div className="modal-footer-btns">
                          <button 
                            className="modal-btn success"
                            onClick={handleEvaluateApplied}
                          >
                            <Sparkles size={14} />
                            <span>Submit for AI Evaluation</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="ai-eval-results">
                        <div className="ai-header">
                          <BrainCircuit size={20} />
                          <span>AI Assessment Engine: Evaluation Report</span>
                        </div>
                        
                        <div className="ai-evaluation-scores">
                          <div className="ai-score-card">
                            <div className="ai-score-val">{appliedEval?.problemSolving} / 10</div>
                            <div className="ai-score-lbl">Problem Solving</div>
                          </div>
                          <div className="ai-score-card">
                            <div className="ai-score-val">{appliedEval?.practicalApp} / 10</div>
                            <div className="ai-score-lbl">Practical Application</div>
                          </div>
                          <div className="ai-score-card">
                            <div className="ai-score-val">{appliedEval?.criticalThink} / 10</div>
                            <div className="ai-score-lbl">Critical Thinking</div>
                          </div>
                        </div>

                        <p className="ai-feedback-text">
                          <strong>Assessment Summary:</strong> {appliedEval?.feedback}
                        </p>

                        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <strong>Submitted Concept Draft:</strong>
                          <p style={{ fontStyle: 'italic', marginTop: '0.25rem' }}>"{appliedText}"</p>
                        </div>

                        <button 
                          className="modal-btn" 
                          style={{ width: 'fit-content', marginTop: '0.5rem' }} 
                          onClick={() => setAppliedSubmitted(false)}
                        >
                          <RefreshCw size={12} /> Re-Submit Proposal
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. COLLABORATIVE SYNTHESIS TAB */}
                {activeTab === 'collaborative' && (
                  <div className="collab-container">
                    <div className="assessment-header">
                      <div className="assessment-meta-info">
                        <div className="assessment-badge collaborative">
                          <Users size={12} /> Collaborative Synthesis Board
                        </div>
                        <h2 style={{ fontSize: '1.25rem', color: 'white' }}>Project-Based Team Dynamics</h2>
                      </div>
                      <div className="assessment-score-tracker">
                        <div className="score-badge">{Math.round(collaborativeScore)} / 20</div>
                        <div className="score-label">Secured Weight</div>
                      </div>
                    </div>

                    {!collabSubmitted ? (
                      <>
                        <div className="collab-roles-section">
                          <span className="section-lbl">Step 1: Delegate Project Responsibilities</span>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            Assign a unique task to Maya, Dev, and Chloe based on their roles.
                          </p>
                          
                          <div className="peers-grid">
                            {PEERS.map((peer, pIdx) => {
                              const currentRole = delegations[peer.name] || ""
                              return (
                                <div key={pIdx} className="peer-card">
                                  <div className="peer-header">
                                    <div className="peer-avatar">{peer.name.charAt(0)}</div>
                                    <div>
                                      <div className="peer-name">{peer.name}</div>
                                      <div className="peer-role-badge">{peer.role}</div>
                                    </div>
                                  </div>
                                  
                                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                                    <select 
                                      className="form-input" 
                                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                                      value={currentRole}
                                      onChange={(e) => handleAssignRole(peer.name, e.target.value)}
                                    >
                                      <option value="">-- Assign Duty --</option>
                                      <option value="data">Data Analysis & Math</option>
                                      <option value="visuals">Visual UI & Sliders</option>
                                      <option value="pitch">Final Presentation Slide</option>
                                    </select>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Conflict Strategy */}
                        <div className="collab-action-panel">
                          <span className="section-lbl" style={{ color: 'var(--color-collaborative)' }}>
                            Step 2: Team Conflict Management Scenario
                          </span>
                          <p className="collab-challenge-desc">
                            {CONFLICT_SCENARIOS[ageGroup as keyof typeof CONFLICT_SCENARIOS].question}
                          </p>
                          <div className="collab-choices">
                            {CONFLICT_SCENARIOS[ageGroup as keyof typeof CONFLICT_SCENARIOS].choices.map((choice, cIdx) => (
                              <button 
                                key={cIdx}
                                className={`collab-choice-btn ${conflictChoice === cIdx ? 'selected' : ''}`}
                                onClick={() => handleSelectConflictChoice(cIdx)}
                              >
                                {choice.text}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Peer feedback */}
                        <div className="collab-roles-section">
                          <span className="section-lbl">Step 3: Submit Teammate Evaluations</span>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Rate how helpful their collaborative dynamics have been.
                          </p>
                          <div className="peers-grid" style={{ marginTop: '0.5rem' }}>
                            {PEERS.map((peer, pIdx) => {
                              const rating = peerRatings[peer.name] || 0
                              return (
                                <div key={pIdx} className="peer-card" style={{ padding: '0.75rem' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{peer.name}</span>
                                  <div className="peer-rating-widget">
                                    <span className="rating-widget-label">Active Contribution:</span>
                                    <div className="stars-list">
                                      {[1, 2, 3, 4, 5].map((starVal) => (
                                        <button
                                          key={starVal}
                                          type="button"
                                          className={`star-btn ${rating >= starVal ? 'active' : ''}`}
                                          onClick={() => handleRatePeer(peer.name, starVal)}
                                        >
                                          <Star size={12} fill={rating >= starVal ? 'currentColor' : 'none'} />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        <div className="modal-footer-btns">
                          <button className="modal-btn primary" style={{ backgroundColor: 'var(--color-collaborative)' }} onClick={handleEvaluateCollaboration}>
                            <Users size={14} />
                            <span>Evaluate Team Synthesis</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <CheckCircle2 size={48} color="#a78bfa" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem' }}>Collaboration Complete</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
                          Your delegation choices and conflict mitigation strategy have been calculated. Here is what your peers wrote back to you:
                        </p>

                        <div className="peers-grid" style={{ textAlign: 'left', maxWidth: '700px', margin: '0 auto' }}>
                          <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <MessageSquare size={14} color="#a78bfa" />
                              <strong style={{ fontSize: '0.85rem' }}>Maya's Review:</strong>
                            </div>
                            <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                              "Appreciate the clarity on tasks! Reallocating work instead of pointing fingers when we got behind kept the team energy positive."
                            </p>
                          </div>
                          
                          <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <MessageSquare size={14} color="#a78bfa" />
                              <strong style={{ fontSize: '0.85rem' }}>Dev's Review:</strong>
                            </div>
                            <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                              "It was helpful that you checked in with me rather than just telling the instructor. That support helped me finish my visual duties."
                            </p>
                          </div>

                          <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <MessageSquare size={14} color="#a78bfa" />
                              <strong style={{ fontSize: '0.85rem' }}>Chloe's Review:</strong>
                            </div>
                            <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                              "Your organization of duties was top-notch. Having clear roles allowed me to start building the presentation speech early."
                            </p>
                          </div>
                        </div>

                        <button 
                          className="modal-btn" 
                          style={{ margin: '1.5rem auto 0', display: 'block' }}
                          onClick={() => setCollabSubmitted(false)}
                        >
                          <RefreshCw size={12} /> Reset Team Portal
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. REFLECTIVE METACOGNITION TAB */}
                {activeTab === 'reflective' && (
                  <div className="reflective-container">
                    <div className="assessment-header">
                      <div className="assessment-meta-info">
                        <div className="assessment-badge reflective">
                          <PenTool size={12} /> Reflective Metacognition Journal
                        </div>
                        <h2 style={{ fontSize: '1.25rem', color: 'white' }}>Learning Signature & Metacognitive Log</h2>
                      </div>
                      <div className="assessment-score-tracker">
                        <div className="score-badge">{Math.round(reflectiveScore)} / 10</div>
                        <div className="score-label">Secured Weight</div>
                      </div>
                    </div>

                    {!reflectiveSubmitted ? (
                      <>
                        <div className="journal-guidelines">
                          <div className="journal-guideline-title">Cognitive Reflection Log</div>
                          <p className="journal-guideline-desc">
                            Metacognition is the anchor of growth. Log what you found difficult in the previous tasks, how you overcame those bottlenecks, and what you discovered about your own learning methods.
                          </p>
                        </div>

                        <div className="response-area">
                          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Personal Reflective Journal Entry
                          </label>
                          <textarea 
                            className="response-textarea" 
                            style={{ minHeight: '140px' }}
                            placeholder="Write your reflection here (e.g. 'I noticed that while answering the series/parallel circuit question, I had to visualize the actual current flowing. In the team scenario, I realized my first instinct was to work alone, but checking in with Dev saved our schedule...')"
                            value={journalText}
                            onChange={(e) => setJournalText(e.target.value)}
                          />
                          <div className="response-limit-label">
                            {journalText.length} characters (Min 30)
                          </div>
                        </div>

                        <div className="modal-footer-btns">
                          <button className="modal-btn primary" style={{ backgroundColor: 'var(--color-reflective)' }} onClick={handleEvaluateReflection}>
                            <Sparkles size={14} />
                            <span>Analyze Learning Signature</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="signature-card">
                        <div className="signature-header">
                          <div>
                            <span className="signature-label">Cognitive Profile Unlocked</span>
                            <div className="signature-title">{learningSignature?.type}</div>
                          </div>
                          <Sparkles size={24} color="#fbbf24" style={{ animation: 'pulseGlow 2s infinite' }} />
                        </div>

                        <p className="signature-desc">
                          {learningSignature?.description}
                        </p>

                        <div className="signature-metrics">
                          <div className="sig-metric">
                            <div className="sig-metric-val">{learningSignature?.conceptual} / 10</div>
                            <div className="sig-metric-lbl">Conceptual Analysis</div>
                          </div>
                          <div className="sig-metric">
                            <div className="sig-metric-val">{learningSignature?.pragmatic} / 10</div>
                            <div className="sig-metric-lbl">Pragmatic Execution</div>
                          </div>
                          <div className="sig-metric">
                            <div className="sig-metric-val">{learningSignature?.collaborative} / 10</div>
                            <div className="sig-metric-lbl">Collaborative Spirit</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                          <button 
                            className="modal-btn" 
                            onClick={() => setReflectiveSubmitted(false)}
                          >
                            <RefreshCw size={12} /> Edit Reflection
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RIPPLE EFFECT & LIVE ANALYTICS */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                  System Outcomes & Expected Impact
                </h3>
                
                {/* 4 Analytics widgets */}
                <div className="impact-grid">
                  <div className="impact-metric-card">
                    <span className="impact-val green">{(foundationalScore > 0) ? "Active" : "Locked"}</span>
                    <span className="impact-lbl">Deeper Understanding</span>
                  </div>
                  <div className="impact-metric-card">
                    <span className="impact-val blue">{Math.round((appliedScore / 30) * 100)}%</span>
                    <span className="impact-lbl">Workforce Readiness</span>
                  </div>
                  <div className="impact-metric-card">
                    <span className="impact-val purple">{(collaborativeScore > 0) ? "Cohesive" : "Independent"}</span>
                    <span className="impact-lbl">Teamwork Synergy</span>
                  </div>
                  <div className="impact-metric-card">
                    <span className="impact-val orange">{anxietyIndex}%</span>
                    <span className="impact-lbl">Student Anxiety Index</span>
                  </div>
                </div>

                {/* Ripple visual nodes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    <Info size={12} color="var(--color-collaborative)" />
                    <span>THE SYSTEMIC RIPPLE EFFECT (Slide 13)</span>
                  </div>
                  
                  <div className="ripple-visualizer">
                    <div className="ripple-connector" style={{
                      background: `linear-gradient(90deg, 
                        var(--color-collaborative) ${((rippleNodes.filter(n => n.active).length - 1) / 4) * 100}%, 
                        rgba(255,255,255,0.05) ${((rippleNodes.filter(n => n.active).length - 1) / 4) * 100}%
                      )`
                    }}></div>
                    {rippleNodes.map((node, nIdx) => (
                      <div key={node.id} className={`ripple-node ${node.active ? 'active' : ''}`}>
                        <div className="ripple-circle">
                          {node.active ? <CheckCircle2 size={16} /> : nIdx + 1}
                        </div>
                        <span className="ripple-circle-label">{node.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* S.P.A.R.K. FRAMEWORK BANNER (SLIDE 12 & 14) */}
              <div className="vision-banner">
                <div className="vision-quote">
                  "Education is the most powerful weapon which you can use to change the world."
                </div>
                <div className="vision-quote-author">— Nelson Mandela</div>

                <div className="vision-footer-grid">
                  <div className="vision-footer-item">
                    <ShieldCheck size={14} className="vision-footer-icon" />
                    <div>
                      <span className="vision-footer-lbl">SECURE</span>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Fairness and integrity.</p>
                    </div>
                  </div>

                  <div className="vision-footer-item">
                    <Scale size={14} className="vision-footer-icon" style={{ color: 'var(--color-applied)' }} />
                    <div>
                      <span className="vision-footer-lbl">FAIR</span>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Equity and inclusion.</p>
                    </div>
                  </div>

                  <div className="vision-footer-item">
                    <Layers size={14} className="vision-footer-icon" style={{ color: 'var(--color-collaborative)' }} />
                    <div>
                      <span className="vision-footer-lbl">INTELLIGENT</span>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Pedagogical innovation.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  )
}
