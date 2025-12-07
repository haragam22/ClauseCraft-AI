export interface ContractData {
  rawText: string;
  sanitizedText: string;
  fileName: string;
}

export enum RiskLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical"
}

// Phase 2: Detailed Clause Structure
export interface KeyClause {
  clause_number: number;
  title: string;
  text: string;
  explanation: string;
  risks: string;
  is_unusual: string;
  industry_normality: string;
  rewritten_safer_version: string;
}

// Phase 2: Full Analysis Result
export interface AnalysisResult {
  is_legal_document?: boolean; // For non-legal detection
  summary: string;
  key_clauses: KeyClause[];
  overall_risks: string;
  missing_clauses: string[];
  contract_quality_score: number;
  unusual_terms: string[];
  industry_comparison_overview: string;
}

// Phase 3: Search Structures
export interface SearchMatch {
  clause_number: string;
  matched_text: string;
  explanation: string;
  reasoning: string;
}

export interface SearchResult {
  query: string;
  matches: SearchMatch[];
}

// Phase 4: Normality
export interface NormalityResult {
  clause_number: string;
  original_text: string;
  is_normal: string;
  industry_comparison: string;
  why_normal_or_not: string;
  typical_clause_example: string;
  recommended_safer_rewrite: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}