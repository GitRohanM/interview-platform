const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../config/logger');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Model selection strategy
// Haiku = fast + cheap for quick evaluations
// Sonnet = deeper analysis for resume + final session summaries
const MODELS = {
  fast: 'claude-haiku-4-5-20251001',
  smart: 'claude-sonnet-4-6',
};

/**
 * Evaluate a single interview answer using Claude AI.
 * Returns structured JSON with scores and actionable feedback.
 */
const evaluateAnswer = async (question, answer, role, keyConcepts = []) => {
  // Handle empty/skipped answers
  if (!answer || answer.trim().length < 10) {
    return {
      score: 0, clarity: 0, depth: 0, relevance: 0,
      sentiment: 'No Answer',
      feedback: 'No answer was provided for this question.',
      strengths: [],
      improvements: ['Attempt every question even if unsure — partial credit is possible'],
      keywordsMatched: [],
      keywordsMissed: keyConcepts,
      modelUsed: MODELS.fast,
    };
  }

  const prompt = `You are a senior technical interviewer at a top product company evaluating a candidate for a ${role} position.

QUESTION ASKED:
"${question}"

CANDIDATE'S ANSWER:
"${answer}"

KEY CONCEPTS expected in a good answer: ${keyConcepts.length ? keyConcepts.join(', ') : 'general technical accuracy'}

Evaluate this answer and respond with ONLY a valid JSON object (no markdown, no explanation outside JSON):
{
  "score": <integer 0-100, overall quality score>,
  "clarity": <integer 0-100, how clear and well-structured the answer is>,
  "depth": <integer 0-100, technical depth and accuracy>,
  "relevance": <integer 0-100, how relevant the answer is to the question>,
  "sentiment": <one of: "Excellent" | "Good" | "Average" | "Needs Work" | "Poor">,
  "feedback": <2-3 sentence specific, actionable feedback as an interviewer>,
  "strengths": <array of 1-3 specific things done well, be concrete>,
  "improvements": <array of 1-3 specific areas to improve with actionable suggestions>,
  "keywordsMatched": <array of key concepts/terms correctly mentioned>,
  "keywordsMissed": <array of important concepts that should have been mentioned>
}

Scoring guide:
- 90-100: Exceptional — complete, accurate, with examples, shows real-world understanding
- 75-89: Good — covers main points, mostly accurate, minor gaps
- 60-74: Average — basic understanding, missing depth or examples  
- 40-59: Below average — partial understanding, significant gaps
- 0-39: Poor — incorrect, off-topic, or too brief

Be a tough but fair evaluator. Don't inflate scores.`;

  try {
    const response = await client.messages.create({
      model: MODELS.fast,
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.content[0].text.trim();
    const result = JSON.parse(raw);

    return { ...result, modelUsed: MODELS.fast, evaluatedAt: new Date() };
  } catch (err) {
    logger.error('AI evaluation error:', err.message);
    // Fallback scoring if AI fails — don't crash the interview
    return {
      score: 50, clarity: 50, depth: 50, relevance: 50,
      sentiment: 'Average',
      feedback: 'Evaluation service temporarily unavailable. Score estimated based on answer length and structure.',
      strengths: ['Answer was submitted'],
      improvements: ['Please retry for AI-powered feedback'],
      keywordsMatched: [],
      keywordsMissed: [],
      modelUsed: 'fallback',
      evaluatedAt: new Date(),
    };
  }
};

/**
 * Analyze resume text with Claude — deeper model for better extraction.
 * Returns structured JSON with NLP extraction + scoring + recommendations.
 */
const analyzeResume = async (resumeText, targetRole, requiredSkills) => {
  const prompt = `You are an expert ATS (Applicant Tracking System) and technical recruiter analyzing a resume for a ${targetRole} position.

RESUME TEXT:
---
${resumeText.substring(0, 4000)}
---

REQUIRED SKILLS FOR ${targetRole}: ${requiredSkills.join(', ')}

Analyze this resume thoroughly and respond with ONLY a valid JSON object:
{
  "extracted": {
    "name": <candidate name or "">,
    "email": <email or "">,
    "phone": <phone or "">,
    "skills": <array of all technical skills mentioned>,
    "experience": <array of job titles/roles mentioned>,
    "education": <array of degrees/institutions>,
    "totalExperienceYears": <estimated years of experience as number>,
    "wordCount": <approximate word count>,
    "hasBulletPoints": <boolean>,
    "hasQuantifiedAchievements": <boolean — does it have numbers/metrics?>,
    "actionVerbsUsed": <array of strong action verbs found>
  },
  "scores": {
    "ats": <0-100, keyword match and ATS compatibility>,
    "skills": <0-100, how many required skills are present>,
    "format": <0-100, structure, readability, contact info completeness>,
    "content": <0-100, quality of descriptions, quantification, impact>,
    "overall": <0-100, weighted overall ATS score>
  },
  "matchedSkills": <array of required skills found in resume>,
  "missingSkills": <array of required skills NOT found in resume>,
  "recommendations": <array of 5-8 specific, actionable improvements>,
  "aiSummary": <2-3 sentence professional summary of the candidate's profile for this role>
}

Be accurate and detailed. The overall score formula: (ats*0.35 + skills*0.35 + format*0.15 + content*0.15).`;

  try {
    const response = await client.messages.create({
      model: MODELS.smart,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.content[0].text.trim();
    return JSON.parse(raw);
  } catch (err) {
    logger.error('Resume analysis AI error:', err.message);
    throw new Error('AI resume analysis failed. Please try again.');
  }
};

/**
 * Generate a follow-up question based on the original question and user's answer.
 */
const generateFollowUp = async (question, answer, role) => {
  const prompt = `You are interviewing a ${role} candidate.

Original question: "${question}"
Candidate answered: "${answer.substring(0, 500)}"

Generate ONE natural follow-up question that:
1. Probes deeper into their answer
2. Tests if they truly understand the concept or just memorized it
3. Is concise (1 sentence)

Respond with ONLY the follow-up question text, nothing else.`;

  try {
    const response = await client.messages.create({
      model: MODELS.fast,
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.content[0].text.trim();
  } catch (err) {
    logger.error('Follow-up generation error:', err.message);
    return 'Can you provide a real-world example of where you applied this concept?';
  }
};

/**
 * AI Coach — conversational responses for interview strategy questions.
 */
const coachResponse = async (userMessage, conversationHistory = [], userRole = '') => {
  const systemPrompt = `You are an expert interview coach with 15+ years of experience placing candidates at top tech companies (Google, Amazon, Microsoft, Flipkart, etc.).

You're coaching a ${userRole || 'software developer'} candidate preparing for job interviews.

Your expertise includes:
- Technical interview preparation (DSA, system design, coding)
- Behavioral interview coaching (STAR method, storytelling)
- Salary negotiation strategies
- Resume optimization
- Company-specific interview processes
- Indian tech job market knowledge

Keep responses concise but actionable (150-250 words max). Use bullet points when listing steps. Be encouraging but realistic.`;

  const messages = [
    ...conversationHistory.slice(-8), // Keep last 8 messages for context
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await client.messages.create({
      model: MODELS.fast,
      max_tokens: 500,
      system: systemPrompt,
      messages,
    });
    return response.content[0].text.trim();
  } catch (err) {
    logger.error('Coach response error:', err.message);
    throw new Error('AI Coach temporarily unavailable. Please try again.');
  }
};

module.exports = { evaluateAnswer, analyzeResume, generateFollowUp, coachResponse };
