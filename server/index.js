const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { rateLimit } = require('express-rate-limit');

// Use path.join to ensure .env is loaded from the server directory regardless of where the process starts
dotenv.config({ path: path.join(__dirname, '.env') });

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rate Limiter: 10 requests per 10 minutes per IP
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many investigations from this precinct. Take a coffee break, Detective.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/analyze', limiter);

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.GROQ_API_KEY;

const MODELS = [
  "llama-3.3-70b-versatile",
  "deepseek-r1-distill-llama-70b",
  "gemma2-9b-it"
];

// Helper for fetch with timeout
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 30000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

app.post('/api/analyze', async (req, res) => {
  const { code, errorMessage, structuralFindings } = req.body;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API Key missing in forensic lab.' });
  }

  const systemPrompt = `
    You are a Senior Forensic Code Investigator. 
    A technical parser has identified "Structural Findings".
    
    YOUR MISSION:
    1. Analyze the code, the error, and the structural findings.
    2. Synthesize a highly detailed, cinematic "Crime Report" in JSON format.
    3. Use hard-boiled detective noir terminology.
    4. GENERATE A LOGICAL EXECUTION TIMELINE leading to the crash.
    
    JSON SCHEMA:
    {
      "caseId": "CC-XXXX",
      "verdict": {
        "title": "string",
        "severity": "CRITICAL | HIGH | MEDIUM | LOW",
        "category": "SYNTAX | LOGIC | PERFORMANCE | SECURITY"
      },
      "executionTimeline": [
        { "step": number, "description": "string", "status": "neutral | warning | danger" }
      ],
      "crimeScene": {
        "suspectLine": number,
        "suspectLineContent": "string",
        "theVictim": "string",
        "theWeapon": "string"
      },
      "investigationNotes": {
        "synopsis": "string",
        "forensicEvidence": "string",
        "recommendation": "string"
      },
      "metadata": {
        "confidenceScore": number
      }
    }
  `;

  const userPrompt = `
    EVIDENCE MATERIAL:
    CODE:
    ${code}

    RUNTIME ERROR:
    ${errorMessage || "No runtime error reported."}

    STRUCTURAL FINDINGS FROM PARSER:
    ${JSON.stringify(structuralFindings, null, 2)}
  `;

  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`Attempting forensic analysis with model: ${model}...`);
      
      const response = await fetchWithTimeout(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000, // 25 second timeout for the API call
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      });

      if (response.status === 429) {
        console.warn(`Model ${model} hit rate limit. Trying fallback...`);
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Model ${model} failed:`, errorData.error?.message);
        lastError = errorData.error?.message || 'Unknown forensic error';
        continue;
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      return res.json(result);

    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`Request to ${model} timed out.`);
        lastError = 'Forensic lab response timed out.';
      } else {
        console.error(`Error with model ${model}:`, error.message);
        lastError = error.message;
      }
      continue;
    }
  }

  // If we reach here, all models failed
  res.status(503).json({ 
    error: 'All forensic models are currently occupied or timed out. Please try again later.',
    details: lastError
  });
});

app.listen(PORT, () => {
  console.log(`Forensic Lab Backend running on http://localhost:${PORT}`);
});
