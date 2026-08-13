/**
 * Resume Analyzer
 * - Keyword engine: ATS score + matched/missing skills (always runs)
 * - OpenAI GPT: deep AI summary + suggestions (runs if API key is set)
 */

const OpenAI = require("openai");

const SKILL_PATTERNS = [
  // Languages
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "ruby", "php", "swift",
  "kotlin", "rust", "scala", "matlab", "bash", "shell", "perl",
  // Frontend
  "react", "angular", "vue", "nextjs", "next.js", "nuxt", "svelte", "html", "css", "sass",
  "tailwind", "bootstrap", "jquery", "redux", "graphql", "webpack", "vite",
  // Backend
  "node.js", "nodejs", "express", "django", "flask", "spring boot", "fastapi", "laravel",
  "nestjs", "nest.js", "rails",
  // Databases
  "mongodb", "mysql", "postgresql", "sqlite", "redis", "elasticsearch", "cassandra",
  "dynamodb", "firebase", "supabase", "oracle",
  // Cloud & DevOps
  "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform", "ansible",
  "nginx", "linux", "ubuntu", "ci/cd", "github actions",
  // Data & AI
  "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "pandas",
  "numpy", "data analysis", "nlp", "computer vision", "langchain", "openai",
  // Tools
  "git", "github", "gitlab", "jira", "confluence", "postman", "figma",
  "agile", "scrum", "rest api", "restful", "microservices", "kafka", "rabbitmq",
  // Mobile
  "react native", "flutter", "android", "ios", "xcode",
];

function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s.#+]/g, " ");
}

function extractSkills(text) {
  if (!text || !text.trim()) return [];
  const normalized = normalize(text);
  const found = new Set();
  for (const skill of SKILL_PATTERNS) {
    if (normalized.includes(skill)) found.add(skill);
  }
  return [...found];
}

function calculateScore(resumeSkills, jdSkills, resumeText) {
  if (jdSkills.length === 0) return 50;
  const matchCount = resumeSkills.filter((s) => jdSkills.includes(s)).length;
  const baseScore = Math.round((matchCount / jdSkills.length) * 100);
  let bonus = 0;
  const rt = (resumeText || "").toLowerCase();
  if (/(summary|objective|profile)/.test(rt))                               bonus += 3;
  if (/\d+\+?\s*years?/.test(rt))                                           bonus += 3;
  if (/(github\.com|linkedin\.com|portfolio)/.test(rt))                     bonus += 2;
  if (/(certified|certification|certificate)/.test(rt))                     bonus += 3;
  if (/(bachelor|master|phd|b\.tech|m\.tech|degree)/.test(rt))             bonus += 3;
  if (/(\d+%|\d+x|improved|increased|reduced|built|led|managed)/.test(rt)) bonus += 4;
  if (/(project|experience|internship|work history)/.test(rt))              bonus += 2;
  return Math.min(100, Math.max(10, baseScore + bonus));
}

function fallbackSuggestions(matchedSkills, missingSkills, resumeText, score) {
  const suggestions = [];
  const rt = (resumeText || "").toLowerCase();
  if (missingSkills.length > 0)
    suggestions.push(`Add experience with ${missingSkills.slice(0, 3).join(", ")} to better match this role.`);
  if (!/(summary|objective|profile)/.test(rt))
    suggestions.push("Add a professional summary at the top of your resume.");
  if (!/(github\.com|linkedin\.com|portfolio)/.test(rt))
    suggestions.push("Include links to your GitHub, LinkedIn, or portfolio.");
  if (!/(certified|certification|certificate)/.test(rt))
    suggestions.push("Consider adding relevant certifications to strengthen your profile.");
  if (!/(\d+%|\d+x|improved|increased|reduced)/.test(rt))
    suggestions.push("Use measurable achievements (e.g., 'improved performance by 30%').");
  if (!/(bachelor|master|phd|b\.tech|m\.tech|degree)/.test(rt))
    suggestions.push("Make sure your educational qualifications are clearly listed.");
  if (score < 60)
    suggestions.push("Tailor your resume more specifically to the job description keywords.");
  if (suggestions.length < 3) {
    suggestions.push("Keep your resume to 1-2 pages for optimal readability.");
    suggestions.push("Use action verbs (built, developed, designed, led) to describe your work.");
  }
  return suggestions.slice(0, 6);
}

function fallbackSummary(matchedSkills, missingSkills, score) {
  const level = score >= 80 ? "strong" : score >= 60 ? "good" : score >= 40 ? "moderate" : "limited";
  const topMatched = matchedSkills.slice(0, 4).join(", ") || "general skills";
  const topMissing = missingSkills.slice(0, 3).join(", ");
  let summary = `Your resume shows a ${level} match for this role with an ATS score of ${score}%. `;
  summary += `Key matching skills include ${topMatched}. `;
  if (topMissing) summary += `To improve your score, consider gaining experience in ${topMissing}. `;
  if (score >= 80) summary += "Your profile is well-aligned with the job requirements.";
  else if (score >= 60) summary += "With a few targeted improvements, you can significantly increase your chances.";
  else summary += "Focus on gaining the missing skills and tailoring your resume to the job description.";
  return summary;
}

async function getAIInsights(resumeText, jobDescription, matchedSkills, missingSkills, atsScore) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here") return null;

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = `You are an expert resume coach and ATS specialist. Analyze this resume against the job description.

RESUME TEXT:
${resumeText.substring(0, 3000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

ATS SCORE (keyword match): ${atsScore}%
MATCHED SKILLS: ${matchedSkills.join(", ") || "none"}
MISSING SKILLS: ${missingSkills.join(", ") || "none"}

Provide a JSON response with exactly this structure:
{
  "aiSummary": "A 3-4 sentence professional analysis of how well this resume matches the job. Be specific about strengths and gaps.",
  "suggestions": [
    "Specific actionable suggestion 1",
    "Specific actionable suggestion 2",
    "Specific actionable suggestion 3",
    "Specific actionable suggestion 4",
    "Specific actionable suggestion 5"
  ]
}

Be specific, professional, and actionable. Reference actual content from the resume and job description.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    });

    const content = response.choices[0].message.content.trim();
    // Extract JSON even if GPT wraps it in markdown
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.aiSummary || !Array.isArray(parsed.suggestions)) return null;

    return {
      aiSummary: parsed.aiSummary,
      suggestions: parsed.suggestions.slice(0, 6),
    };
  } catch (err) {
    console.error("OpenAI error — falling back to keyword analysis:", err.message);
    return null;
  }
}

async function analyzeResume(resumeText, jobDescription) {
  const resumeSkills  = extractSkills(resumeText);
  const jdSkills      = extractSkills(jobDescription);
  const matchedSkills = resumeSkills.filter((s) => jdSkills.includes(s));
  const missingSkills = jdSkills.filter((s) => !resumeSkills.includes(s));
  const atsScore      = calculateScore(resumeSkills, jdSkills, resumeText);

  // Try OpenAI for summary + suggestions, fall back to keyword engine
  const aiInsights = await getAIInsights(resumeText, jobDescription, matchedSkills, missingSkills, atsScore);

  const aiSummary   = aiInsights ? aiInsights.aiSummary   : fallbackSummary(matchedSkills, missingSkills, atsScore);
  const suggestions = aiInsights ? aiInsights.suggestions : fallbackSuggestions(matchedSkills, missingSkills, resumeText, atsScore);

  return {
    atsScore,
    matchedSkills,
    missingSkills,
    suggestions,
    aiSummary,
    aiPowered: !!aiInsights,
  };
}

module.exports = analyzeResume;
