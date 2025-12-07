import { ai, MODELS } from './client';
import { securityLayer } from './securityLayer';
import { AnalysisResult, NormalityResult } from '../types';

/**
 * Normality Check Module (Phase 4)
 * Benchmarks specific clauses against industry standards.
 */

export const normalityCheck = {
  benchmarkClause: async (
    clauseNumber: string,
    clauseText: string,
    contractText: string,
    analysisJson: AnalysisResult
  ): Promise<NormalityResult> => {
    return securityLayer.secureExecute(
      clauseText,
      'Benchmark Clause Normality',
      async (safeClauseText) => {
        // We also need to be careful passing the large contract/analysis to the prompt
        // PII redaction happens on the primary input (clauseText) in secureExecute, 
        // but we should ideally ensure other inputs are safe too. 
        // For this specific architecture, we assume analysisJson is already sanitized from previous steps.
        
        const prompt = `
You are ContractGuard Benchmark — an expert system that compares legal clauses
against industry standards and best practices using publicly-known patterns.

Your tasks:
1. Read the provided clause text and its clause number.
2. Compare it with typical standards in:
   - NDAs
   - Employment agreements
   - Service Agreements (SLA / MSA)
   - Licensing agreements
   - General commercial contracts
3. Identify:
   - Typical ranges
   - Industry norms
   - Common deviations
   - Whether this clause is normal or unusual
4. Provide:
   - A 3–5 line explanation
   - Concrete example of a typical version of this clause
   - A safer or more standard rewrite
5. Return ONLY JSON in this structure:

{
  "clause_number": "${clauseNumber}",
  "original_text": "${safeClauseText}",
  "is_normal": "",
  "industry_comparison": "",
  "why_normal_or_not": "",
  "typical_clause_example": "",
  "recommended_safer_rewrite": ""
}

Context Data:
Clause Number: ${clauseNumber}
Clause Text: "${safeClauseText}"
Full Sanitized Contract: "${contractText.substring(0, 10000)}..."
Analysis Context: ${JSON.stringify(analysisJson).substring(0, 5000)}
`;

        const response = await ai.models.generateContent({
          model: MODELS.TEXT,
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response.text) {
          try {
            return JSON.parse(response.text) as NormalityResult;
          } catch (e) {
            throw new Error("Failed to parse normality JSON");
          }
        }
        throw new Error("No response generated");
      }
    );
  }
};
