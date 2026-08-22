import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    subject: {
      type: String,
      default: 'General',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Foundational', 'Applied', 'Collaborative', 'Reflective'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    },
    ageGroups: {
      type: [String],
      required: [true, 'Age groups are required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one age group must be specified',
      },
    },
    frameworks: {
      type: [String],
      required: [true, 'Frameworks are required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one educational framework must be specified',
      },
    },
    bloomLevel: {
      type: String,
      required: [true, 'Bloom Level is required'],
      trim: true,
    },
    questionType: {
      type: String,
      default: 'MultipleChoice',
      enum: ['MultipleChoice', 'OpenEnded', 'TrueFalse'],
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: 'A question must have at least 2 options',
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Correct answer index is required'],
      min: [0, 'Correct answer index cannot be negative'],
    },
    explanation: {
      type: String,
      trim: true,
    },
    estimatedTime: {
      type: Number,
      default: 60, // in seconds
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: String,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

export const Question = mongoose.model('Question', questionSchema);
export default Question;
