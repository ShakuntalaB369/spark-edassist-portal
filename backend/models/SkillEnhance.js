import mongoose from 'mongoose';

const skillEnhanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ageGroup: { type: String, required: true },
  questions: [{
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    questionType: { type: String, required: true },
    options: [String],
    correctAnswer: { type: String },
    explanation: { type: String },
    subject: { type: String, required: true },
    globalContext: { type: String, required: true },
    category: { type: String },
    bloomLevel: { type: String },
    difficulty: { type: String },
    references: [{
      title: { type: String },
      source: { type: String },
      url: { type: String }
    }]
  }],
  answers: [{
    questionId: { type: String, required: true },
    selectedAnswer: { type: String },
    isCorrect: { type: Boolean, required: true }
  }],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timeTaken: { type: Number },
  report: { type: mongoose.Schema.Types.Mixed },
  completedAt: { type: Date, default: Date.now },
  deletedFromHistory: { type: Boolean, default: false }
}, { timestamps: true });

export const SkillEnhance = mongoose.model('SkillEnhance', skillEnhanceSchema);
export default SkillEnhance;
