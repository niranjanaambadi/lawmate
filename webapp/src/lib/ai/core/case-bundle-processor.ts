// src/lib/ai/core/case-bundle-processor.ts
import { ClassifiedDocument } from './document-classifier';

export interface CaseBundle {
  caseId: string;
  documents: ClassifiedDocument[];
  petition?: ClassifiedDocument;
  counter?: ClassifiedDocument;
  rejoinder?: ClassifiedDocument;
  annexures: ClassifiedDocument[];
  orders: ClassifiedDocument[];
}

export interface BundleAnalysis {
  keyFacts: string[];
  changes: Array<{
    stage: string;
    description: string;
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  }>;
  contradictions: Array<{
    documents: string[];
    issue: string;
    description: string;
  }>;
  reliefMapping: Array<{
    reliefSought: string;
    status: string;
    oppositionArguments: string[];
  }>;
  argumentPoints: Array<{
    topic: string;
    petitionerPosition: string;
    respondentPosition: string;
    strength: 'STRONG' | 'MODERATE' | 'WEAK';
  }>;
}

export class CaseBundleProcessor {
  constructor(private claude: ClaudeClient) {}

  organizeBundl(documents: ClassifiedDocument[]): CaseBundle {
    return {
      caseId: '',
      documents,
      petition: documents.find(d => d.type === 'PETITION'),
      counter: documents.find(d => d.type === 'COUNTER_AFFIDAVIT'),
      rejoinder: documents.find(d => d.type === 'REJOINDER'),
      annexures: documents.filter(d => d.type === 'ANNEXURE'),
      orders: documents.filter(d => 
        d.type === 'INTERIM_ORDER' || d.type === 'DAILY_ORDER'
      )
    };
  }

  async analyzeBundle(bundle: CaseBundle): Promise<BundleAnalysis> {
    const context = this.buildBundleContext(bundle);
    
    const prompt = `Analyze this case bundle and provide comprehensive analysis.

Focus on:
1. Key facts from petition and subsequent developments
2. Changes/developments since initial filing
3. Contradictions between documents
4. Relief sought vs. opposition arguments
5. Argument evolution across pleadings

Respond in JSON format:
{
  "keyFacts": ["fact 1", "fact 2"],
  "changes": [{"stage": "", "description": "", "impact": "POSITIVE|NEGATIVE|NEUTRAL"}],
  "contradictions": [{"documents": [], "issue": "", "description": ""}],
  "reliefMapping": [{"reliefSought": "", "status": "", "oppositionArguments": []}],
  "argumentPoints": [{"topic": "", "petitionerPosition": "", "respondentPosition": "", "strength": ""}]
}`;

    const response = await this.claude.analyzeWithCache(
      prompt,
      context,
      '',
      4096
    );

    return JSON.parse(response);
  }

  private buildBundleContext(bundle: CaseBundle): string {
    let context = '# Case Bundle Context\n\n';
    
    if (bundle.petition) {
      context += `## Petition\n${bundle.petition.extractedText}\n\n`;
    }
    
    if (bundle.counter) {
      context += `## Counter Affidavit\n${bundle.counter.extractedText}\n\n`;
    }
    
    if (bundle.rejoinder) {
      context += `## Rejoinder\n${bundle.rejoinder.extractedText}\n\n`;
    }

    if (bundle.orders.length > 0) {
      context += `## Orders\n`;
      bundle.orders.forEach(order => {
        context += `### ${order.title}\n${order.extractedText}\n\n`;
      });
    }

    return context;
  }
}