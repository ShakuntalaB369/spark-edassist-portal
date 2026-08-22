import { questionService } from '../services/questionService.js';

export const createQuestion = async (req, res, next) => {
  try {
    const question = await questionService.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

export const getAllQuestions = async (req, res, next) => {
  try {
    const { category, difficulty } = req.query;
    const questions = await questionService.getAll({ category, difficulty });
    return res.status(200).json({
      success: true,
      message: 'Questions retrieved successfully',
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (req, res, next) => {
  try {
    const question = await questionService.getById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
        errors: [{ message: `No question found with ID: ${req.params.id}` }]
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Question retrieved successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const question = await questionService.update(req.params.id, req.body);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
        errors: [{ message: `No question found with ID: ${req.params.id}` }]
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await questionService.delete(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
        errors: [{ message: `No question found with ID: ${req.params.id}` }]
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};
