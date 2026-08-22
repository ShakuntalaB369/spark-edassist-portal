import mongoose from 'mongoose';

const generatedQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
  },
  correctAnswer: {
    type: String,
  },
  expectedAnswer: {
    type: String,
  },
  explanation: {
    type: String,
  },
  category: {
    type: String,
  },
  difficulty: {
    type: String,
  },
  bloomLevel: {
    type: String,
  },
  questionType: {
    type: String,
  },
  references: [{
    title: { type: String },
    source: { type: String },
    url: { type: String }
  }],
}, { timestamps: true });

export const GeneratedQuestion = mongoose.model('GeneratedQuestion', generatedQuestionSchema);
export default GeneratedQuestion;
