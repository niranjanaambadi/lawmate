// src/app/api/cases/[caseId]/documents/classify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { DocumentClassifier } from '@/lib/ai/core/document-classifier';
import { ClaudeClient } from '@/lib/ai/core/claude-client';
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

    const { documentIds } = await req.json();

    if (!documentIds || !Array.isArray(documentIds)) {
      return NextResponse.json(
        { error: 'Invalid document IDs' },
        { status: 400 }
      );
    }

    const documents = await prisma.document.findMany({
      where: {
        id: { in: documentIds },
        caseId: params.caseId,
        case: {
          userId: session.user.id,
        },
      },
    });

    if (documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents found' },
        { status: 404 }
      );
    }

    const claude = new ClaudeClient();
    const classifier = new DocumentClassifier();

    const classifications = await classifier.classifyBatch(
      documents.map(d => ({
        id: d.id,
        fileName: d.fileName,
        text: d.extractedText || '',
      }))
    );

    // Save classifications
    await Promise.all(
      classifications.map(c =>
        prisma.documentClassification.upsert({
          where: { documentId: c.id },
          create: {
            documentId: c.id,
            type: c.type,
            confidence: c.confidence,
            metadata: c.metadata,
          },
          update: {
            type: c.type,
            confidence: c.confidence,
            metadata: c.metadata,
          },
        })
      )
    );

    return NextResponse.json({ classifications });
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Classification failed', details: error.message },
      { status: 500 }
    );
  }
}