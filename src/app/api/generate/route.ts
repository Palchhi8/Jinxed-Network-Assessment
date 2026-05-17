import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateImage } from '@/lib/huggingface';

const GenerationStatus = {
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export async function POST(req: NextRequest) {
  let createdGenerationId: string | null = null;

  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, model = 'stabilityai/sdxl-turbo', settings, parentId } = body;

    // 1. Validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Map mock and Fal models to the free Hugging Face SDXL Turbo model identifier
    const resolvedModel = model.includes('mock') || model.includes('fal') ? 'stabilityai/sdxl-turbo' : model;

    // 2. Create Generation record in Prisma with PROCESSING status
    const generation = await prisma.generation.create({
      data: {
        prompt: prompt.trim(),
        model: resolvedModel,
        status: GenerationStatus.PROCESSING,
        settings: settings || null,
        parentId: parentId || null,
      },
    });

    createdGenerationId = generation.id;

    // 3. Call Hugging Face SDXL Turbo image generation
    const hfOptions = {
      prompt: prompt.trim(),
      model: resolvedModel,
      aspectRatio: settings?.aspectRatio || '16:9',
      seed: typeof settings?.seed === 'number' ? settings.seed : undefined,
    };

    const hfResult = await generateImage(hfOptions);

    // Update settings payload with the actual seed returned by Hugging Face
    const updatedSettings = settings ? {
      ...settings,
      seed: hfResult.seed,
    } : {
      seed: hfResult.seed,
    };

    // 4. Update Generation status to COMPLETED with real Base64 Data URL and seed
    const completedGeneration = await prisma.generation.update({
      where: { id: createdGenerationId },
      data: {
        status: GenerationStatus.COMPLETED,
        imageUrl: hfResult.imageUrl,
        settings: updatedSettings,
      },
    });

    // 5. Return the completed generation object
    return NextResponse.json(completedGeneration, { status: 200 });


  } catch (error) {
    console.error('Error in generation API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process generative request.';

    // If record was created, mark it as FAILED for complete tracking
    if (createdGenerationId) {
      try {
        await prisma.generation.update({
          where: { id: createdGenerationId },
          data: { status: GenerationStatus.FAILED },
        });
      } catch (dbError) {
        console.error('Failed to update status to FAILED in error catch:', dbError);
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const generations = await prisma.generation.findMany({
      where: {
        status: GenerationStatus.COMPLETED,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(generations, { status: 200 });
  } catch (error) {
    console.error('Error in generations GET route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve generations.';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

