import Question from '../models/Question.js';

export const questionService = {
  create: async (data) => {
    return await Question.create(data);
  },

  getAll: async (filters = {}) => {
    // Basic filtering support
    const query = {};
    if (filters.category) query.category = filters.category;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    return await Question.find(query).sort({ createdAt: -1 });
  },

  getById: async (id) => {
    return await Question.findById(id);
  },

  update: async (id, data) => {
    return await Question.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  delete: async (id) => {
    return await Question.findByIdAndDelete(id);
  },
};
