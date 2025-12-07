import { ai, MODELS } from './client';
import { securityLayer } from './securityLayer';
import { AnalysisResult } from '../types';

/**
 * Enhanced Summary Module (Phase 4)
 * Generates a richer, executive-style summary.
 */

export const enhancedSummary = {
  generate: async (contractText: string, analysisJson: AnalysisResult): Promise<string> => {
    return securityLayer.secureExecute(
      contractText,
      'Improved Summary',
      async (safeContractText) => {
        const prompt = `
You are ContractGuard Summary+ — produce a richer, more detailed, more polished summary.

Requirements:
1. 10–15 line executive-style summary.
2. Highlight:
   - contract purpose
   - key obligations of each party
   - payment terms
   - liabilities
   - termination conditions
   - confidentiality periods
   - major risks
3. Use simple English, no legal jargon.
4. Do NOT return JSON.
5. Return plain text only.

Context:
Sanitized Text: "${safeContractText.substring(0, 20000)}"
Analysis Data: ${JSON.stringify(analysisJson).substring(0, 5000)}
`;

        const response = await ai.models.generateContent({
          model: MODELS.TEXT,
          contents: prompt,
        });

        return response.text || "Failed to generate improved summary.";
      }
    );
  }
};
