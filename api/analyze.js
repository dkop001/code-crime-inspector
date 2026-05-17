import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.GROQ_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

const MODELS = [
  "llama-3.3-70b-versatile",
  "deepseek-r1-distill-llama-70b",
  "gemma2-9b-it"
];

// Helper for fetch with timeout
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 9000 } = options; 
  
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

async function checkRateLimit(ip) {
  if (!DATABASE_URL) {
    console.warn('DATABASE_URL missing. Skipping persistent rate limiting.');
    return { allowed: true };
  }

  try {
    const sql = neon(DATABASE_URL);
    
    // 1. Record the request
    await sql`INSERT INTO request_logs (ip_address) VALUES (${ip})`;
    
    // 2. Count requests in the last 10 minutes
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM request_logs 
      WHERE ip_address = ${ip} 
      AND created_at > NOW() - INTERVAL '10 minutes'
    `;
    
    const count = parseInt(result[0].count);
    const limit = 10; // 10 requests per 10 minutes
    
    if (count > limit) {
      return { allowed: false, count, limit };
    }
    
    return { allowed: true, count, limit };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open to avoid blocking users if the DB is down, but log it
    return { allowed: true };
  }
}

export default async function handler(req, res) {
  // Manual CORS handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get client IP for rate limiting
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  
  // Persistent Rate Limiting check
  const rateLimitStatus = await checkRateLimit(ip);
  if (!rateLimitStatus.allowed) {
    return res.status(429).json({ 
      error: 'Too many investigations from this precinct. Take a coffee break, Detective.',
      details: `Limit: ${rateLimitStatus.limit} requests per 10 minutes.`
    });
  }

  const { code, errorMessage, structuralFindings, language } = req.body;

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
    LANGUAGE: ${language || 'javascript'}

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
        timeout: 8500, 
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
      return res.status(200).json(result);

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

  return res.status(503).json({ 
    error: 'All forensic models are currently occupied or timed out. Please try again later.',
    details: lastError
  });
}
