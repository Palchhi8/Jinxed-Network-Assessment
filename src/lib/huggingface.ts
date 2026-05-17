import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face Inference client
// Uses HF_TOKEN or HF_ACCESS_TOKEN if configured in .env (recommended to prevent rate-limits)
const hfToken = process.env.HF_TOKEN || process.env.HF_ACCESS_TOKEN || '';
const hf = new HfInference(hfToken);

export interface GenerateImageOptions {
  prompt: string;
  aspectRatio?: string;
  seed?: number;
}

export interface GenerateImageResult {
  imageUrl: string;
  seed: number;
  model: string;
}

/**
 * Generates an image using the Hugging Face free Inference API.
 * Leverages stabilityai/sdxl-turbo for near-instant, high-quality free generations.
 */
export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
  const {
    prompt,
    seed,
  } = options;

  const model = 'stabilityai/sdxl-turbo';

  try {
    console.log('[Hugging Face] Starting free image generation...');
    console.log('[Hugging Face] Prompt:', prompt);

    // Call the text-to-image API
    const responseBlob = await hf.textToImage({
      model,
      inputs: prompt,
      parameters: {
        // SDXL Turbo is optimized to run in a single high-quality step
        num_inference_steps: 1,
        guidance_scale: 0.0, // SDXL Turbo works best with 0.0 guidance
        ...(seed !== undefined ? { seed } : {}),
      },
    });

    console.log('[Hugging Face] Response blob received successfully.');

    // Convert binary blob response to Base64 Data URL
    const blob = responseBlob as unknown as Blob;
    const buffer = await blob.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      throw new Error('Hugging Face API returned an empty image binary blob.');
    }

    const base64 = Buffer.from(buffer).toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64}`;

    console.log('[Hugging Face] Image converted to Base64 Data URL successfully.');

    return {
      imageUrl,
      seed: seed || Math.floor(Math.random() * 9999999),
      model,
    };
  } catch (error) {
    console.error('[Hugging Face] Generation Error:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Hugging Face free image generation failed.'
    );
  }
}
