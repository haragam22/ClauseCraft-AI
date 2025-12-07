import { ai, MODELS } from './client';

/**
 * Contract Parser Module
 * Handles file reading and text extraction.
 */

export const contractParser = {
  /**
   * Parses a file object or raw text input into a standardized string format.
   * Supports plain text and PDF via Gemini Vision.
   */
  parse: async (input: File | string): Promise<string> => {
    if (typeof input === 'string') {
      return input;
    }

    if (input.type === 'application/pdf') {
      return await extractPdfText(input);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };

      reader.onerror = () => {
        reject(new Error("File read error"));
      };

      // Default to text reading for other types
      reader.readAsText(input);
    });
  }
};

/**
 * Helper to extract text from PDF using Gemini Vision
 */
async function extractPdfText(file: File): Promise<string> {
  const base64Data = await fileToBase64(file);
  
  const response = await ai.models.generateContent({
    model: MODELS.TEXT,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Data
          }
        },
        {
          text: "Extract all readable text from this PDF. Do not summarize. Return raw contract text only."
        }
      ]
    }
  });

  return response.text || "";
}

/**
 * Helper to convert File to Base64 string (without data URL prefix)
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g. "data:application/pdf;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
}