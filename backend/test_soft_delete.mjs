import { getMyMastery, deleteAssessment, getMyAssessments } from './controllers/assessmentController.js';

// Setup mock database storage
let db = [
  {
    _id: 'a1',
    userId: 'user123',
    email: 'student@example.com',
    configuration: {
      subject: 'Mathematics',
      ageGroup: '15-18',
      globalContext: 'Finland',
      category: 'Foundational',
      difficulty: 'Easy',
      bloomLevel: 'Understand',
      questionType: 'MCQ',
      numberOfQuestions: 10
    },
    questions: [],
    answers: [],
    score: 3,
    totalQuestions: 10,
    correctAnswers: 3,
    incorrectAnswers: 7,
    percentage: 30,
    deletedFromHistory: false
  },
  {
    _id: 'a2',
    userId: 'user123',
    email: 'student@example.com',
    configuration: {
      subject: 'Physics',
      ageGroup: '15-18',
      globalContext: 'Finland',
      category: 'Foundational',
      difficulty: 'Easy',
      bloomLevel: 'Understand',
      questionType: 'MCQ',
      numberOfQuestions: 10
    },
    questions: [],
    answers: [],
    score: 2,
    totalQuestions: 10,
    correctAnswers: 2,
    incorrectAnswers: 8,
    percentage: 20,
    deletedFromHistory: false
  }
];

// Mock Mongoose Assessment model
import { Assessment } from './models/Assessment.js';
Assessment.find = (query) => {
  const result = db.filter(item => item.userId === query.userId);
  const chain = {
    select(fields) {
      return this;
    },
    sort(order) {
      return this;
    },
    then(resolve) {
      return Promise.resolve(resolve(result));
    }
  };
  return chain;
};
Assessment.findOne = async (query) => {
  return db.find(item => item._id === query._id && (!query.deletedFromHistory || (query.deletedFromHistory.$ne && item.deletedFromHistory !== true)));
};
Assessment.findById = async (id) => {
  return db.find(item => item._id === id);
};
Assessment.findByIdAndUpdate = async (id, update) => {
  const item = db.find(item => item._id === id);
  if (item) {
    Object.assign(item, update);
  }
  return item;
};

// Setup mock request and response
const createMockReqRes = (userId, params = {}, body = {}) => {
  const req = {
    user: { _id: userId, email: 'student@example.com' },
    params,
    body
  };
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.data = obj;
      return this;
    }
  };
  return { req, res };
};

const runTest = async () => {
  console.log('\n================ Testing Assessment Soft Delete Behavior (Mock DB) ================');
  
  const testUserId = 'user123';

  // 1. Fetch initial mastery and history
  const { req: reqHistoryInit, res: resHistoryInit } = createMockReqRes(testUserId);
  await getMyAssessments(reqHistoryInit, resHistoryInit);
  console.log(`Initial history count: ${resHistoryInit.data.data.length} assessments`);

  const { req: reqMasteryInit, res: resMasteryInit } = createMockReqRes(testUserId);
  await getMyMastery(reqMasteryInit, resMasteryInit);
  console.log('Initial Mastery Score (Foundational):', resMasteryInit.data.data.foundational); // Expected (30 + 20) / 2 = 25%
  
  if (resMasteryInit.data.data.foundational !== 25) {
    console.error('❌ FAIL: Initial mastery is not 25%');
    process.exit(1);
  }

  // 2. Delete one assessment (soft delete a2)
  console.log('Soft deleting assessment a2...');
  const { req: reqDelete, res: resDelete } = createMockReqRes(testUserId, { id: 'a2' });
  await deleteAssessment(reqDelete, resDelete);
  
  if (resDelete.statusCode !== 200 || !resDelete.data.success) {
    console.error('❌ FAIL: Delete API did not succeed');
    process.exit(1);
  }

  // 3. Fetch history and assert a2 is soft-deleted, but returned in my assessments for calculation
  const { req: reqHistoryPost, res: resHistoryPost } = createMockReqRes(testUserId);
  await getMyAssessments(reqHistoryPost, resHistoryPost);
  console.log(`Post-delete history returned count (total stored): ${resHistoryPost.data.data.length}`);
  
  const visibleAssessments = resHistoryPost.data.data.filter(item => !item.deletedFromHistory);
  console.log(`Visible history count: ${visibleAssessments.length}`);
  
  if (visibleAssessments.length !== 1) {
    console.error('❌ FAIL: Visible history count should be 1');
    process.exit(1);
  }

  // 4. Fetch mastery post-delete and assert it is STILL 25% (unaffected by soft delete)
  const { req: reqMasteryPost, res: resMasteryPost } = createMockReqRes(testUserId);
  await getMyMastery(reqMasteryPost, resMasteryPost);
  console.log('Post-delete Mastery Score (Foundational):', resMasteryPost.data.data.foundational); // Expected still 25%
  
  if (resMasteryPost.data.data.foundational !== 25) {
    console.error('❌ FAIL: Mastery recalculated after soft-delete!');
    process.exit(1);
  }

  console.log('\n✅ SUCCESS! Soft delete keeps cumulative mastery stats untouched.');
  process.exit(0);
};

runTest();
