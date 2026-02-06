// src/lib/ai/processors/narrative-optimizer.ts
import { ClaudeClient } from '../core/claude-client';

export interface NarrativeSection {
  sectionName: string;
  currentText: string;
  clarityScore: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  issues: string[];
  suggestions: string[];
}

export interface ArgumentSequence {
  currentOrder: string[];
  suggestedOrder: string[];
  rationale: string;
}

export interface RevisionSuggestion {
  location: string;
  issue: string;
  currentText: string;
  suggestedText: string;
  rationale: string;
}

export interface PersuasivenessMetrics {
  readerEngagement: number; // 0-100
  emotionalRationalBalance: number; // 0-100 (50 is balanced)
  tone: 'ASSERTIVE' | 'AGGRESSIVE' | 'CAUTIOUS' | 'BALANCED';
  emphasisClarity: number; // 0-100
}

export interface NarrativeAnalysis {
  sections: NarrativeSection[];
  argumentSequence: ArgumentSequence;
  persuasivenessMetrics: PersuasivenessMetrics;
  revisionSuggestions: RevisionSuggestion[];
  benchPerspective: {
    likelyReaction: string;
    attentionRisks: string[];
    strengths: string[];
  };
  alternativeStructures: Array<{
    name: string;
    description: string;
    pros: string[];
    cons: string[];
  }>;
}

export class NarrativeOptimizer {
  constructor(private claude: ClaudeClient) {}

  async optimize(petitionText: string, caseType: string): Promise<NarrativeAnalysis> {
    const prompt = `Analyze this ${caseType} petition for narrative structure and persuasiveness.

Evaluate:
1. Argument sequencing and logical flow
2. Clarity of each section
3. Redundancy and unnecessary verbosity
4. Persuasiveness metrics (engagement, tone, emphasis)
5. How a Kerala HC judge would react
6. Specific revision suggestions with examples

Kerala HC specific:
- Kerala HC bench preferences for argument presentation
- Optimize for oral submissions style
- Consider typical bench workload (clarity is critical)

Provide:
- Section-by-section analysis with scores
- Optimal argument sequencing
- Persuasiveness metrics
- Before/after revision examples
- Bench perspective analysis
- Alternative narrative structures

Petition text:
${petitionText}

Respond in JSON format matching NarrativeAnalysis interface.`;

    const response = await this.claude.analyze(prompt, '', 8192);
    return JSON.parse(response);
  }

  async optimizeSection(
    sectionText: string, 
    sectionPurpose: string,
    context: string
  ): Promise<{
    analysis: string;
    revisedText: string;
    improvements: string[];
  }> {
    const prompt = `Optimize this petition section for maximum persuasiveness.

Section purpose: ${sectionPurpose}
Context: ${context}

Section text:
${sectionText}

Provide:
1. Analysis of current effectiveness
2. Revised text (maintain legal accuracy)
3. List of specific improvements made

Respond in JSON format.`;

    const response = await this.claude.analyze(prompt, '', 4096);
    return JSON.parse(response);
  }
}