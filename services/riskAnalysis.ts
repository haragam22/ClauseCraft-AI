import { ai, MODELS } from './client';
import { Type } from "@google/genai";
import { AnalysisResult } from '../types';
import { securityLayer } from './securityLayer';

/**
 * Risk Analysis Module (Phase 2)
 * Core analyzer that produces the deep JSON breakdown.
 */

export const riskAnalysis = {
  analyze: async (contractText: string): Promise<AnalysisResult> => {
    return securityLayer.secureExecute(
      contractText,
      'Risk Analysis Phase 2',
      async (safeText) => {
        const prompt = `
You are ContractGuard — an advanced legal contract analysis system.

Return JSON ONLY.

First, check if the provided text is a legal contract or related legal document.
If it is clearly NOT a legal document (e.g. a recipe, a novel, random text), return ONLY:
{ "is_legal_document": false, "summary": "Invalid document type", "key_clauses": [], "overall_risks": "", "missing_clauses": [], "contract_quality_score": 0, "unusual_terms": [], "industry_comparison_overview": "" }

If it IS a legal document, analyze the sanitized contract text and produce:

1. summary (5–10 lines)
2. key_clauses: list of clauses with details.
3. overall_risks
4. missing_clauses
5. contract_quality_score (0–100)
6. unusual_terms
7. industry_comparison_overview

Output MUST be valid clean JSON with this structure:

{
  "is_legal_document": true,
  "summary": "",
  "key_clauses": [
    {
      "clause_number": 1,
      "title": "",
      "text": "extract the exact text",
      "explanation": "",
      "risks": "",
      "is_unusual": "yes/no",
      "industry_normality": "",
      "rewritten_safer_version": ""
    }
  ],
  "overall_risks": "",
  "missing_clauses": [],
  "contract_quality_score": 0,
  "unusual_terms": [],
  "industry_comparison_overview": ""
}

Sanitized text:
"${safeText.substring(0, 40000)}"
`;

        const response = await ai.models.generateContent({
          model: MODELS.TEXT,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
             // We use loose schema validation or raw JSON parsing to allow the flexible "is_legal_document" check
          }
        });

        if (response.text) {
          try {
            const result = JSON.parse(response.text) as AnalysisResult;
            if (result.is_legal_document === false) {
               throw new Error("The uploaded document does not appear to be a legal contract.");
            }
            return result;
          } catch (e: any) {
             if (e.message.includes("legal contract")) throw e;
             throw new Error("Failed to parse analysis results.");
          }
        }
        
        throw new Error("Failed to generate analysis");
      }
    );
  }
};