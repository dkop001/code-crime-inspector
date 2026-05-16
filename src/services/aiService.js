const BACKEND_URL = '/api/analyze';

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

    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorMessage = 'Failed to contact the forensic lab.';
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        const textError = await response.text();
        console.error('Server returned non-JSON error:', textError);
      }
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      console.error('Expected JSON but got:', text);
      throw new Error('The forensic lab returned an illegible report (non-JSON).');
    }
  } catch (error) {
    console.error('Forensic Lab Connection Error:', error);
    throw error;
  }
};
