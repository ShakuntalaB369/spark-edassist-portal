import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  configuration: {
    subject: { type: String, required: true },
    ageGroup: { type: String, required: true },
    globalContext: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, required: true },
    bloomLevel: { type: String, required: true },
    questionType: { type: String, required: true },
    numberOfQuestions: { type: Number, required: true }
  },
  questions: [{
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    questionType: { type: String, required: true },
    options: [String],
    category: { type: String },
    difficulty: { type: String },
    bloomLevel: { type: String },
    correctAnswer: { type: String },
    explanation: { type: String },
    references: [{
      title: { type: String },
      source: { type: String },
      url: { type: String }
    }]
  }],
  answers: [{
    questionId: { type: String, required: true },
    selectedAnswer: { type: String },
    isCorrect: { type: Boolean, required: true },
    reasoning: { type: String },
    confidence: { type: Number }
  }],
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  incorrectAnswers: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  report: {
    strengths: [String],
    weakAreas: [String],
    bloomAnalysis: mongoose.Schema.Types.Mixed,
    categoryAnalysis: mongoose.Schema.Types.Mixed,
    difficultyAnalysis: mongoose.Schema.Types.Mixed,
    recommendations: [{
      topic: String,
      reason: String,
      recommendation: String
    }],
    suggestedTopics: [String],
    summary: String
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  deletedFromHistory: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound index for efficient user history search
assessmentSchema.index({ userId: 1, createdAt: -1 });

export const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
