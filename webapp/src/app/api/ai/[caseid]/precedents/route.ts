// src/app/api/ai/[caseId]/precedents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ClaudeClient } from '@/lib/ai/core/claude-client';
import { PrecedentValidator } from '@/lib/ai/processors/precedent-validator';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify case access
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

    // Build case bundle
    const petition = case_.documents.find(
      d => d.classification?.type === 'PETITION'
    );

    if (!petition) {
      return NextResponse.json(
        { error: 'No petition found in case bundle' },
        { status: 400 }
      );
    }

    const bundle = {
      caseId: params.caseId,
      documents: case_.documents.map(d => ({
        id: d.id,
        type: d.classification?.type || 'OTHER',
        title: d.fileName,
        extractedText: d.extractedText || '',
        confidence: d.classification?.confidence || 0,
        metadata: d.classification?.metadata || {},
      })),
      petition: {
        id: petition.id,
        type: 'PETITION' as const,
        title: petition.fileName,
        extractedText: petition.extractedText || '',
        confidence: 1,
        metadata: {},
      },
      counter: undefined,
      rejoinder: undefined,
      annexures: [],
      orders: [],
    };

    // Run precedent analysis
    const claude = new ClaudeClient();
    const validator = new PrecedentValidator(claude);
    const analysis = await validator.validate(bundle, case_.caseType);

    // Save analysis
    await prisma.aIAnalysis.create({
      data: {
        caseId: params.caseId,
        type: 'PRECEDENT_VALIDATION',
        result: analysis as any,
        status: 'COMPLETED',
      },
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Precedent analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error.message },
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
        type: 'PRECEDENT_VALIDATION',
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
        { error: 'No analysis found' },
        { status: 404 }
      );
    }

    return NextResponse.json(analysis.result);
  } catch (error) {
    console.error('Error fetching precedent analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}