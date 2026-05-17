import { fal } from '@fal-ai/client';

export interface GenerateImageOptions {
  prompt: string;
  aspectRatio?: string;
  steps?: number;
  guidanceScale?: number;
  seed?: number;
  model?: string;
}

export interface GenerateImageResult {
  imageUrl: string;
  seed: number;
}

/**
 * Maps standard UI aspect ratios to Fal.ai Flux aspect ratio strings
 */
function mapAspectRatio(ratio: string): 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9' {
  switch (ratio) {
    case '16:9':
      return 'landscape_16_9';
    case '9:16':
      return 'portrait_16_9';
    case '1:1':
    default:
      return 'square_hd';
  }
}

interface FalImageResponse {
  images: Array<{ url: string }>;
  seed?: number;
}

/**
 * Generates an image using the Fal.ai Flux Schnell engine.
 */
export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
  const {
    prompt,
    aspectRatio = '16:9',
    seed,
  } = options;

  const imageSize = mapAspectRatio(aspectRatio);

  try {
    // Invoke the Flux Schnell model via Fal.ai API
    const response = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt,
        image_size: imageSize,
        num_inference_steps: 4, // Schnell is hyper-optimized for 4 steps
        enable_safety_checker: true,
        sync_mode: true,
        ...(seed !== undefined ? { seed } : {}),
      },
      logs: false,
    });

    const data = response.data as FalImageResponse;
    
    if (!data || !data.images || data.images.length === 0) {
      throw new Error('Fal.ai returned a response with no images.');
    }

    const imageUrl = data.images[0].url;
    const responseSeed = typeof data.seed === 'number' ? data.seed : (seed || 0);

    return {
      imageUrl,
      seed: responseSeed,
    };
  } catch (error) {
    console.error('Fal.ai image generation failure:', error);
    throw new Error(error instanceof Error ? error.message : 'Fal.ai image generation failed.');
  }
}
