import { HfInference } from "@huggingface/inference";

const hfToken = process.env.HUGGINGFACE_API_KEY;

if (!hfToken) {
  throw new Error("HUGGINGFACE_API_KEY is missing in .env");
}

const hf = new HfInference(hfToken);

export interface GenerateImageOptions {
  prompt: string;
  model?: string;
  aspectRatio?: string;
  seed?: number;
}

export interface GenerateImageResult {
  imageUrl: string;
  seed: number;
  model: string;
}

/**
 * Generate AI image using Hugging Face Inference API
 */
export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResult> {
  const { prompt, seed, model = "stabilityai/stable-diffusion-xl-base-1.0" } = options;

  try {
    console.log("[HF] Starting image generation...");
    console.log("[HF] Prompt:", prompt);

    // Generate image
    const response = await hf.textToImage({
      model,
      inputs: prompt,
      parameters: {
        num_inference_steps: 20,
        ...(seed !== undefined ? { seed } : {}),
      },
    });

    console.log("[HF] Image response received.");

    // Convert Blob -> Buffer -> Base64
    const blob = response as unknown as Blob;
    const arrayBuffer = await blob.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("Empty image response from Hugging Face");
    }

    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const imageUrl = `data:image/png;base64,${base64}`;

    console.log("[HF] Base64 image created successfully.");

    return {
      imageUrl,
      seed: seed || Math.floor(Math.random() * 1000000),
      model,
    };
  } catch (error) {
    console.error("[HF] Generation Error:", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Hugging Face image generation failed"
    );
  }
}