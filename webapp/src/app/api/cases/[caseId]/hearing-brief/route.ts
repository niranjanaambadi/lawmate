// src/app/api/cases/[caseId]/hearing-brief/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { ClaudeClient } from '@/lib/ai/core/claude-client';
import { CaseBundleProcessor } from '@/lib/ai/core/case-bundle-processor';
import { buildCaseBundle } from '@/lib/utils/bundle-builder';

export async function POST(
  req: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hearingDate, focusAreas } = await req.json();

    const caseRecord = await prisma.case.findUnique({
      where: { id: params.caseId },
      include: { documents: true }
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const bundle = await buildCaseBundle(params.caseId);
    const claude = new ClaudeClient();

    // Get bundle analysis
    const processor = new CaseBundleProcessor(claude);
    const bundleAnalysis = await processor.analyzeBundle(bundle);

    // Get latest analyses
    const analyses = await prisma.aIAnalysis.findMany({
      where: {
        caseId: params.caseId,
        analysisType: {
          in: ['PRECEDENTS', 'RISK_ASSESSMENT', 'RIGHTS_MAPPING', 'COUNTER_ANTICIPATION']
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 4
    });

    const context = `
# Case Bundle Analysis
${JSON.stringify(bundleAnalysis, null, 2)}

# AI Analyses
${analyses.map(a => `## ${a.analysisType}\n${JSON.stringify(a.result, null, 2)}`).join('\n\n')}
`;

    const prompt = `Generate a concise hearing day brief for ${hearingDate || 'upcoming hearing'}.

Focus areas: ${focusAreas?.join(', ') || 'All aspects'}

The brief should include:
1. **Case Summary** (3-4 sentences)
2. **Key Facts** (bullet points, max 5)
3. **Relief Sought** (specific prayers)
4. **Main Arguments** (3-5 core points with supporting precedents)
5. **Anticipated Counter-Arguments** (with responses)
6. **Changes Since Last Hearing** (if applicable)
7. **Contradictions to Address** (if any)
8. **Constitutional Grounds** (Articles invoked)
9. **Critical Precedents** (top 3 with citations)
10. **Oral Submission Strategy** (key points to emphasize)

Format as structured markdown for easy reading in court.
This is NOT a rewritten petition - it's a brief for lawyer preparation.`;

    const brief = await claude.analyzeWithCache(
      prompt,
      context,
      `Hearing Date: ${hearingDate}`,
      8192
    );

    // Save the brief
    const savedBrief = await prisma.hearingBrief.create({
      data: {
        caseId: params.caseId,
        hearingDate: hearingDate ? new Date(hearingDate) : new Date(),
        content: brief,
        focusAreas: focusAreas || []
      }
    });

    return NextResponse.json({
      id: savedBrief.id,
      content: brief,
      generatedAt: savedBrief.createdAt
    });
  } catch (error) {
    console.error('Hearing brief error:', error);
    return NextResponse.json(
      { error: 'Failed to generate hearing brief' },
      { status: 500 }
    );
  }
}