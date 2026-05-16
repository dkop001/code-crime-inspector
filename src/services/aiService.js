const BACKEND_URL = 'http://localhost:3001/api/analyze';

export const analyzeCodeCrimeWithFindings = async (code, errorMessage, structuralFindings) => {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        errorMessage,
        structuralFindings
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to contact the forensic lab.');
    }

    return await response.json();
  } catch (error) {
    console.error('Forensic Lab Connection Error:', error);
    throw error;
  }
};
