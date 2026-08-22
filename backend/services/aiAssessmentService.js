import { aiService, safeExtractJSON } from './aiService.js';

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

    console.log('[AI] Subject:', subject);
    console.log('[AI] Age Group:', ageGroup);
    console.log('[AI] Context:', globalContext);
    console.log('[AI] Difficulty:', difficulty);
    console.log('[AI] Category:', category);
    console.log('[AI] Questions requested:', numberOfQuestions);

    const systemInstruction = `
You are an expert educational assessment developer. Your task is to generate high-quality, clear, and pedagogically sound questions.
You must strictly follow the provided parameters:
- Subject: ${subject}
- Age Group: ${ageGroup} (ensure vocabulary, reading level, and concepts are highly appropriate for this age range)
- Global Educational Context: ${globalContext} (align concepts, tone, or context with this country's pedagogical standards, assessment style, and real-world scenarios where appropriate. Do not force irrelevant references).
- Assessment Category: ${category}
- Difficulty: ${difficulty}
- Bloom's Taxonomy Level: ${bloomLevel}
- Question Type: ${questionType}
- Number of Questions to generate: ${numberOfQuestions}

CRITICAL RULES FOR QUESTION GENERATION:
0. THINKING LIMIT: Keep your thinking process (within <think>...</think> tags) extremely brief and under 50 words. Immediately output the JSON once the brief thinking is done.
1. SUBJECT-SPECIFICITY: The questions MUST test actual, specific concepts in "${subject}".
   - Mathematics: Generate actual math problems (e.g., algebra, geometry, probability, equations) requiring calculation or logic.
   - Physics: Generate specific physical scenarios (e.g., motion, force, energy, thermodynamics).
   - English: Generate specific grammar, vocabulary, usage, or comprehension questions.
   - NEVER generate generic questions like "Explain a core concept of ${subject} appropriate for a student..."
2. UNIQUENESS: Every question must be completely unique. Do not repeat question structures, concepts, or wording. Randomize topics within the subject to ensure variety. No duplicate options.
3. DISTRACTORS: Incorrect options must be plausible and related directly to the specific scenario.
4. Avoid any generic placeholder-style distractors or options (like 'Primary structural framework', 'Supporting auxiliary component', 'Conceptual implementation guideline', 'None of the above', or 'All of the above').
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

    const userPrompt = `Generate exactly ${numberOfQuestions} unique, concept-specific questions of type ${questionType} for subject ${subject} targeting age group ${ageGroup} under global context ${globalContext}.
Ensure options are highly specific to the questions asked, and all options are completely unique.

CRITICAL FORMATTING INSTRUCTION:
You MUST output a single valid JSON object following the structure below.
Do NOT output a list like "Concept: ... Context: ... Question: ...".
Do NOT output any markdown tags or headings.
Return ONLY this JSON object structure:
{
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string (must match one of options)",
      "category": "${category}",
      "difficulty": "${difficulty}",
      "bloomLevel": "${bloomLevel}",
      "questionType": "${questionType}",
      "explanation": "string",
      "references": []
    }
  ]
}
`;

    try {
      const response = await aiService.generateAIResponse(userPrompt, systemInstruction);
      const text = response.content;
      if (!text) {
        throw new Error('Empty response received from AI service');
      }

      let parsed;
      if (typeof text === 'object' && text !== null) {
        // Gemini already returns parsed JSON object
        parsed = text;
        console.log('[AI] JSON extraction successful (object from Gemini)');
      } else {
        // Groq / other providers return raw string — use robust extractor
        parsed = safeExtractJSON(text);
      }

      // Validate the response schema
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('AI response does not contain a valid questions array');
      }
      console.log('[AI] JSON validation successful');

      if (parsed.questions.length !== parseInt(numberOfQuestions)) {
        console.warn(`[AI] Expected ${numberOfQuestions} questions but got ${parsed.questions.length}. Proceeding with available.`);
        // Accept if we have at least 1 question rather than failing entirely
        if (parsed.questions.length === 0) {
          throw new Error('AI returned 0 questions');
        }
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

      console.log(`[AI] Questions generated: ${parsed.questions.length}`);
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
        parsed = safeExtractJSON(text);
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
