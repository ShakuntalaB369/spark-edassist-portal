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

CRITICAL RULES FOR QUESTION GENERATION:
1. Every question in the same assessment must be uniquely different, testing a distinct subtopic or concept of "${subject}" (e.g., if subject is Physics, cover different concepts like motion, acceleration, forces, pressure, waves, electricity, thermodynamics, etc.).
2. Do NOT repeat question structures, wording templates, or reuse the same prompt template.
3. Distractors (incorrect choices) must be contextually plausible and related directly to the question's specific scenario.
4. Avoid any generic placeholder-style distractors or options (like 'Primary structural framework', 'Supporting auxiliary component', 'Conceptual implementation guideline', or 'None of the above').
5. Exactly ONE option must be clearly correct. The correctAnswer must match one of the options elements exactly.
6. Ensure every question is independently answerable without relying on previous or subsequent questions.

For each question, you MUST also generate a "references" array containing 1 to 3 reputable educational learning resources specifically relevant to the concept tested.
The resources should be age-appropriate for the student (ageGroup: ${ageGroup}).
URLs must be syntactically valid HTTPS links from reputable platforms (e.g., Khan Academy, Britannica, NASA, National Geographic, MIT, Stanford, official university or government education sites, MDN, Python docs).
Do NOT invent URLs. Ensure the URLs are valid and functional.

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

    const userPrompt = `Generate exactly ${numberOfQuestions} unique, concept-specific questions of type ${questionType} for subject ${subject} targeting age group ${ageGroup} under global context ${globalContext}. Ensure options are highly specific to the questions asked, and all options are completely unique.`;

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

      const seenQuestions = new Set();

      // Validate each question individual elements
      parsed.questions.forEach((q, idx) => {
        if (!q.question || typeof q.question !== 'string') {
          throw new Error(`Question at index ${idx} is missing question text`);
        }
        
        // Uniqueness validation check
        const normalizedQText = q.question.trim().toLowerCase();
        if (seenQuestions.has(normalizedQText)) {
          throw new Error(`Duplicate question text detected at index ${idx}`);
        }
        seenQuestions.add(normalizedQText);

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
          
          // Check for placeholder/generic distractors
          const genericPlaceholders = [
            'primary structural framework',
            'supporting auxiliary component',
            'conceptual implementation guideline',
            'none of the above options apply',
            'all of the above'
          ];
          const hasPlaceholders = q.options.some(opt => 
            genericPlaceholders.some(p => opt.toLowerCase().includes(p))
          );
          if (hasPlaceholders) {
            throw new Error(`MCQ at index ${idx} contains generic placeholder options`);
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
      console.error('[AI Assessment] Question generation flow failed!');
      console.error(`- Error Message: ${error.message}`);
      console.error(`- Parameters attempted -> Subject: "${subject}", AgeGroup: "${ageGroup}", Context: "${globalContext}", Difficulty: "${difficulty}", Category: "${category}"`);
      throw error;
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
