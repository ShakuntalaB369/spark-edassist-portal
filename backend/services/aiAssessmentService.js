import { aiService } from './aiService.js';

const validateReferences = (refs) => {
  if (!refs || !Array.isArray(refs)) return [];
  const validRefs = [];
  const urlsSeen = new Set();
  
  for (const ref of refs) {
    if (!ref || typeof ref !== 'object') continue;
    const { title, url, source } = ref;
    if (typeof title !== 'string' || typeof url !== 'string' || typeof source !== 'string') continue;
    
    // Check HTTPS syntax
    if (!url.startsWith('https://')) continue;
    
    try {
      const parsedUrl = new URL(url);
      // Valid hostname
      if (!parsedUrl.hostname || !parsedUrl.hostname.includes('.')) continue;
      
      // Check duplicate
      const normalizedUrl = url.trim().toLowerCase();
      if (urlsSeen.has(normalizedUrl)) continue;
      
      urlsSeen.add(normalizedUrl);
      validRefs.push({
        title: title.trim(),
        source: source.trim(),
        url: url.trim()
      });
      
      if (validRefs.length >= 3) break; // Limit to max 3
    } catch (e) {
      // Invalid URL syntax
      continue;
    }
  }
  return validRefs;
};

export const aiAssessmentService = {
  generateQuestions: async (config) => {
    const {
      subject,
      ageGroup,
      globalContext,
      category,
      difficulty,
      bloomLevel,
      questionType,
      numberOfQuestions
    } = config;

    const systemInstruction = `
You are an expert educational assessment developer. Your task is to generate high-quality, clear, and pedagogically sound questions.
You must strictly follow the provided parameters:
- Subject: ${subject}
- Age Group: ${ageGroup} (ensure vocabulary, reading level, and concepts are highly appropriate for this age range)
- Global Educational Context / Framework: ${globalContext} (align concepts, tone, or context with this country's pedagogical standards, assessment style, and real-world scenarios where appropriate. For example: Singapore focuses on skills development, applied learning, and structured problem-solving; Finland focuses on learner-centered, competency-based self-reflection; Japan focuses on analytical synthesis and precision; Germany incorporates structured applied/vocational context; India incorporates appropriate regional academic concepts. Integrate the selected country's educational context into the question design and/or scenario where relevant, but do not force irrelevant references into every question).
- Assessment Category: ${category}
- Difficulty: ${difficulty}
- Bloom's Taxonomy Level: ${bloomLevel}
- Question Type: ${questionType}
- Number of Questions to generate: ${numberOfQuestions}

For each question, you MUST also generate a "references" array containing 1 to 3 reputable educational learning resources specifically relevant to the concept tested.
The resources should be age-appropriate for the student (ageGroup: ${ageGroup}).
URLs must be syntactically valid HTTPS links from reputable platforms (e.g., Khan Academy, Britannica, NASA, National Geographic, MIT, Stanford, official university or government education sites, MDN, Python docs).
Do NOT invent URLs. Ensure the URLs are valid and functional.

Avoid:
- Duplicate questions or option choices.
- Ambiguity or multiple correct interpretations.
- Factual errors.
- Any unsafe, biased, political, or inappropriate content.

Return ONLY a valid JSON object matching the following structure:
For MCQ (questionType = "MCQ"):
{
  "questions": [
    {
      "id": "string (unique uuid or index)",
      "question": "string (the question text)",
      "options": ["string", "string", "string", "string"], // exactly 4 options
      "correctAnswer": "string (must exactly match one of the options)",
      "category": "${category}",
      "difficulty": "${difficulty}",
      "bloomLevel": "${bloomLevel}",
      "questionType": "MCQ",
      "explanation": "string (short reasoning)",
      "references": [
        {
          "title": "string",
          "source": "string (reputable platform name)",
          "url": "string (valid HTTPS URL)"
        }
      ]
    }
  ]
}

For True/False (questionType = "True/False"):
{
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": ["True", "False"],
      "correctAnswer": "string (must be either 'True' or 'False')",
      "category": "${category}",
      "difficulty": "${difficulty}",
      "bloomLevel": "${bloomLevel}",
      "questionType": "True/False",
      "explanation": "string",
      "references": [
        {
          "title": "string",
          "source": "string",
          "url": "string (valid HTTPS URL)"
        }
      ]
    }
  ]
}

For Short Answer (questionType = "Short Answer"):
{
  "questions": [
    {
      "id": "string",
      "question": "string",
      "expectedAnswer": "string (the expected short answer response)",
      "category": "${category}",
      "difficulty": "${difficulty}",
      "bloomLevel": "${bloomLevel}",
      "questionType": "Short Answer",
      "explanation": "string",
      "references": [
        {
          "title": "string",
          "source": "string",
          "url": "string (valid HTTPS URL)"
        }
      ]
    }
  ]
}
`;

    const userPrompt = `Generate exactly ${numberOfQuestions} questions of type ${questionType} for subject ${subject} targeting age group ${ageGroup} under global context ${globalContext}.`;

    try {
      const response = await aiService.generateAIResponse(userPrompt, systemInstruction);
      const text = response.content;
      if (!text) {
        throw new Error('Empty response received from AI service');
      }

      let parsed;
      if (typeof text === 'object' && text !== null) {
        parsed = text;
      } else {
        const cleanedText = text.trim();
        try {
          parsed = JSON.parse(cleanedText);
        } catch (err) {
          try {
            parsed = JSON.parse(JSON.parse(cleanedText));
          } catch (_) {
            throw new Error(`Failed to parse AI output as JSON: ${cleanedText}`);
          }
        }
      }

      // Validate the response schema
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('AI response does not contain a valid questions array');
      }

      if (parsed.questions.length !== parseInt(numberOfQuestions)) {
        throw new Error(`AI generated ${parsed.questions.length} questions, expected exactly ${numberOfQuestions}`);
      }

      // Validate each question individual elements
      parsed.questions.forEach((q, idx) => {
        if (!q.question || typeof q.question !== 'string') {
          throw new Error(`Question at index ${idx} is missing question text`);
        }
        if (!q.category) q.category = category;
        if (!q.difficulty) q.difficulty = difficulty;
        if (!q.bloomLevel) q.bloomLevel = bloomLevel;
        if (!q.questionType) q.questionType = questionType;

        if (questionType === 'MCQ') {
          if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
            throw new Error(`MCQ at index ${idx} must have exactly 4 options`);
          }
          if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
            throw new Error(`MCQ at index ${idx} has invalid correctAnswer: must match one of the options`);
          }
        } else if (questionType === 'True/False') {
          if (!q.options || !Array.isArray(q.options) || q.options.length !== 2) {
            throw new Error(`True/False at index ${idx} must have exactly 2 options`);
          }
          if (q.correctAnswer !== 'True' && q.correctAnswer !== 'False') {
            throw new Error(`True/False at index ${idx} correctAnswer must be 'True' or 'False'`);
          }
        } else if (questionType === 'Short Answer') {
          if (!q.expectedAnswer) {
            throw new Error(`Short Answer at index ${idx} is missing expectedAnswer`);
          }
        }
        q.references = validateReferences(q.references);
      });

      return parsed.questions;
    } catch (error) {
      console.warn('[AI Assessment] Generation failed, returning static fallback questions list:', error.message);
      
      const count = parseInt(numberOfQuestions) || 5;
      const fallbackQuestions = [];
      
      for (let i = 0; i < count; i++) {
        if (questionType === 'MCQ') {
          fallbackQuestions.push({
            id: `fb-q-${i}-${Date.now()}`,
            question: `Explain a core concept of ${subject || 'Education'} appropriate for a student in the ${ageGroup || '15-18'} age bracket under the context of ${globalContext || 'Finland'}. (Question ${i + 1})`,
            options: [
              "Option A: Primary structural framework",
              "Option B: Supporting auxiliary component",
              "Option C: Conceptual implementation guideline",
              "Option D: None of the above options apply"
            ],
            correctAnswer: "Option A: Primary structural framework",
            category: category || 'Foundational',
            difficulty: difficulty || 'Medium',
            bloomLevel: bloomLevel || 'Understand',
            questionType: 'MCQ',
            explanation: "Option A represents the primary conceptual structure.",
            references: [
              {
                title: "Introduction to educational frameworks",
                source: "Wikipedia",
                url: "https://en.wikipedia.org/wiki/Educational_assessment"
              }
            ]
          });
        } else if (questionType === 'True/False') {
          fallbackQuestions.push({
            id: `fb-q-${i}-${Date.now()}`,
            question: `In ${globalContext || 'Finland'}, the educational framework for ${subject || 'Education'} prioritizes student competency over metrics. (Question ${i + 1})`,
            options: ["True", "False"],
            correctAnswer: "True",
            category: category || 'Foundational',
            difficulty: difficulty || 'Medium',
            bloomLevel: bloomLevel || 'Remember',
            questionType: 'True/False',
            explanation: "True is correct based on general competency-based educational standards.",
            references: []
          });
        } else {
          fallbackQuestions.push({
            id: `fb-q-${i}-${Date.now()}`,
            question: `What is the primary objective of studying ${subject || 'Education'} under the ${globalContext || 'Finland'} framework for age group ${ageGroup || '15-18'}? (Question ${i + 1})`,
            expectedAnswer: "To build learner competency, critical thinking and conceptual synthesis.",
            category: category || 'Foundational',
            difficulty: difficulty || 'Medium',
            bloomLevel: bloomLevel || 'Analyze',
            questionType: 'Short Answer',
            explanation: "The core focus is on building lifelong student competency rather than rote metrics.",
            references: []
          });
        }
      }
      return fallbackQuestions;
    }
  },

  evaluateShortAnswer: async (questionData, studentAnswer) => {
    const systemInstruction = `
You are an expert educational assessment grader. Your task is to evaluate a student's short answer response semantically.
Compare the student's answer against the expected answer / criteria.

Evaluation criteria:
- Relevance to the question
- Conceptual correctness
- Inclusion of key concepts / points
- Logical reasoning
- Completeness
- Age-appropriate understanding

Rules:
- DO NOT require exact wording matches. Semantically equivalent answers must be graded as CORRECT.
- Minor grammar or spelling errors should NOT make an answer incorrect.
- Grade the answer as CORRECT (true) or INCORRECT (false) with a confidence level (0.0 to 1.0) and include a concise reasoning detailing the semantic evaluation result.

Return ONLY a valid JSON object matching the following structure:
{
  "correct": true,
  "confidence": 0.95,
  "reasoning": "A concise explanation of why the answer is correct or incorrect based on the evaluation criteria."
}
`;

    const userPrompt = `
Subject: ${questionData.subject || 'General'}
Age Group: ${questionData.ageGroup || '15-18'}
Bloom's Taxonomy Level: ${questionData.bloomLevel || 'Analyze'}
Difficulty: ${questionData.difficulty || 'Medium'}

Original Question:
"${questionData.question}"

Expected Answer / Criteria:
"${questionData.expectedAnswer}"

Student's Submitted Answer:
"${studentAnswer}"
`;

    try {
      const response = await aiService.generateAIResponse(userPrompt, systemInstruction);
      const text = response.content;
      if (!text) {
        throw new Error('Empty response received from AI service during evaluation');
      }

      let parsed;
      if (typeof text === 'object' && text !== null) {
        parsed = text;
      } else {
        const cleanedText = text.trim();
        try {
          parsed = JSON.parse(cleanedText);
        } catch (err) {
          try {
            parsed = JSON.parse(JSON.parse(cleanedText));
          } catch (_) {
            throw new Error(`Failed to parse AI output as JSON: ${cleanedText}`);
          }
        }
      }
      if (typeof parsed.correct !== 'boolean' || typeof parsed.confidence !== 'number') {
        throw new Error('Invalid schema received from AI service during evaluation');
      }

      return parsed;
    } catch (error) {
      console.error('AI Short Answer evaluation failed:', error);
      throw error;
    }
  }
};

export default aiAssessmentService;
