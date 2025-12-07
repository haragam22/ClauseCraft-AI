import { ai, MODELS } from './client';
import { securityLayer } from './securityLayer';
import { AnalysisResult, SearchResult } from '../types';

/**
 * Natural Language Search Module (Phase 3)
 * Allows structured querying of the contract.
 */

export const nlSearch = {
  searchContract: async (query: string, contractText: string, analysisJson: AnalysisResult): Promise<SearchResult> => {
    return securityLayer.secureExecute(
      contractText, // Primary input to secure/redact
      'NL Search Phase 3',
      async (safeContractText) => {
        const prompt = `
You are ContractGuard Search — an intelligent search system
for reading and locating information inside legal contracts.

Your tasks:
1. Understand the user's query.
2. Search inside the sanitized contract text AND inside the clause JSON provided below.
3. Return EXACT:
   - the relevant clause number(s)
   - the matched text
   - a short explanation (3–5 lines)
   - why this part is relevant to the user's query
4. If multiple matches exist, return them all.
5. If nothing is found, return an empty matches array.

Return ONLY valid JSON in this structure:

{
  "query": "${query}",
  "matches": [
    {
      "clause_number": "",
      "matched_text": "",
      "explanation": "",
      "reasoning": ""
    }
  ]
}

Data Sources:
User Query: "${query}"
Analysis JSON: ${JSON.stringify(analysisJson).substring(0, 5000)}
Sanitized Contract Text: "${safeContractText.substring(0, 30000)}"
`;

        const response = await ai.models.generateContent({
          model: MODELS.TEXT,
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response.text) {
          return JSON.parse(response.text) as SearchResult;
        }
        return { query, matches: [] };
      }
    );
  },

  // Keep legacy method if needed, or remove. Keeping for compatibility if ChatInterface uses it.
  query: async (query: string, contractText: string): Promise<string> => {
      // Fallback simple chat
      return securityLayer.secureExecute(contractText, 'Simple Chat', async (safeText) => {
         const res = await ai.models.generateContent({
             model: MODELS.TEXT,
             contents: `Answer this about the contract: ${query}\n\nContract: ${safeText.substring(0,20000)}`
         });
         return res.text || "";
      });
  }
};