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
  model: string;
  metadata?: {
    width?: number;
    height?: number;
    contentType?: string;
  };
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
  images: Array<{
    url: string;
    width?: number;
    height?: number;
    content_type?: string;
  }>;
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

  console.log('[Fal.ai Provider] Starting generation request...');
  console.log('[Fal.ai Provider] Prompt:', prompt);
  console.log('[Fal.ai Provider] Input Aspect Ratio:', aspectRatio);

  // 1. Environment Key Validation
  const apiKey = process.env.FAL_KEY || process.env.FAL_API_KEY;
  if (!apiKey) {
    const errorMsg = 'FAL_KEY environment variable is not defined or is empty in .env. Please configure it to authorize AI generation.';
    console.error('[Fal.ai Provider] Validation Error:', errorMsg);
    throw new Error(errorMsg);
  }

  // 2. Explicit Client Authorization Setup
  try {
    fal.config({
      credentials: apiKey,
    });
  } catch (configError) {
    console.warn('[Fal.ai Provider] Warning: Failed to configure credentials explicitly:', configError);
  }

  const imageSize = mapAspectRatio(aspectRatio);
  const targetModel = 'fal-ai/flux/schnell';

  try {
    console.log(`[Fal.ai Provider] Querying model "${targetModel}" on size: "${imageSize}"...`);

    // 3. Invoke the Flux Schnell model via Fal.ai API
    const response = await fal.subscribe(targetModel, {
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

    console.log('[Fal.ai Provider] Raw response received successfully.');

    // 4. Robust Response JSON Parsing & Extraction
    const data = response.data as FalImageResponse;
    if (!data) {
      throw new Error('Fal.ai returned an empty or malformed JSON body payload.');
    }

    if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
      throw new Error('Fal.ai response is missing the target images list array or returned empty outputs.');
    }

    const firstImage = data.images[0];
    if (!firstImage || typeof firstImage.url !== 'string' || firstImage.url.trim() === '') {
      throw new Error('Fal.ai response image object is missing a valid destination URL property.');
    }

    const imageUrl = firstImage.url;
    const responseSeed = typeof data.seed === 'number' ? data.seed : (seed || 0);

    console.log('[Fal.ai Provider] Successfully extracted Image URL:', imageUrl);
    console.log('[Fal.ai Provider] Seed:', responseSeed);

    return {
      imageUrl,
      seed: responseSeed,
      model: targetModel,
      metadata: {
        width: firstImage.width,
        height: firstImage.height,
        contentType: firstImage.content_type,
      },
    };
  } catch (error) {
    console.error('[Fal.ai Provider] API Request Failure:', error);
    throw new Error(error instanceof Error ? error.message : 'Fal.ai image generation API failed.');
  }
}
