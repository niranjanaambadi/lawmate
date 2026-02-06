// src/app/api/ai/[caseId]/risk-assessment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ClaudeClient } from '@/lib/ai/core/claude-client';
import { RiskAssessor } from '@/lib/ai/processors/risk-assessor';
import { prisma } from '@/lib/db';
import { buildCaseBundle } from '@/lib/ai/utils/bundle-builder';

export async function POST(
  req: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const case_ = await prisma.case.findFirst({
      where: {
        id: params.caseId,
        userId: session.user.id,
      },
      include: {
        documents: {
          include: {
            classification: true,
          },
        },
      },
    });

    if (!case_) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const bundle = buildCaseBundle(case_.documents);
    
    const claude = new ClaudeClient();
    const assessor = new RiskAssessor(claude);
    const assessment = await assessor.assess(bundle, case_.caseType);

    await prisma.aIAnalysis.create({
      data: {
        caseId: params.caseId,
        type: 'RISK_ASSESSMENT',
        result: assessment as any,
        status: 'COMPLETED',
      },
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Risk assessment error:', error);
    return NextResponse.json(
      { error: 'Assessment failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analysis = await prisma.aIAnalysis.findFirst({
      where: {
        caseId: params.caseId,
        type: 'RISK_ASSESSMENT',
        case: {
          userId: session.user.id,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'No assessment found' },
        { status: 404 }
      );
    }

    return NextResponse.json(analysis.result);
  } catch (error) {
    console.error('Error fetching risk assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}