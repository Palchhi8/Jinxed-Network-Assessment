import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GenerationStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  let createdGenerationId: string | null = null;

  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, model = 'mock-model', settings, parentId } = body;

    // 1. Validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // 2. Create Generation record in Prisma with PROCESSING status
    const generation = await prisma.generation.create({
      data: {
        prompt: prompt.trim(),
        model,
        status: GenerationStatus.PROCESSING,
        settings: settings || null,
        parentId: parentId || null,
      },
    });

    createdGenerationId = generation.id;

    // 3. Simulate AI generation compute delay (2.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // 4. Determine realistic placeholder image depending on prompt contents
    const normalizedPrompt = prompt.toLowerCase();
    let selectedPlaceholder = '/placeholders/placeholder_3.png'; // default: workspace

    if (
      normalizedPrompt.includes('city') ||
      normalizedPrompt.includes('cyber') ||
      normalizedPrompt.includes('neon') ||
      normalizedPrompt.includes('street')
    ) {
      selectedPlaceholder = '/placeholders/placeholder_1.png'; // Cyberpunk City
    } else if (
      normalizedPrompt.includes('forest') ||
      normalizedPrompt.includes('nature') ||
      normalizedPrompt.includes('tree') ||
      normalizedPrompt.includes('mystic') ||
      normalizedPrompt.includes('glow')
    ) {
      selectedPlaceholder = '/placeholders/placeholder_2.png'; // Mystical Forest
    } else {
      // Pick random placeholder for generic prompts
      const index = Math.floor(Math.random() * 3) + 1;
      selectedPlaceholder = `/placeholders/placeholder_${index}.png`;
    }

    // 5. Update Generation status to COMPLETED with generated image URL
    const completedGeneration = await prisma.generation.update({
      where: { id: createdGenerationId },
      data: {
        status: GenerationStatus.COMPLETED,
        imageUrl: selectedPlaceholder,
      },
    });

    // 6. Return the completed generation object
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
