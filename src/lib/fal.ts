import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY!,
});

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

function mapAspectRatio(ratio: string) {
  switch (ratio) {
    case "16:9":
      return "landscape_16_9";

    case "9:16":
      return "portrait_16_9";

    case "1:1":
    default:
      return "square_hd";
  }
}

interface FalImageResponse {
  images: Array<{
    url: string;
  }>;
  seed?: number;
}

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResult> {
  const {
    prompt,
    aspectRatio = "16:9",
    seed,
  } = options;

  const imageSize = mapAspectRatio(aspectRatio);

  const model = "fal-ai/flux/schnell";

  try {
    console.log("[Fal] Starting generation...");
    console.log("[Fal] Prompt:", prompt);

    const response = await fal.run(model, {
      input: {
        prompt,
        image_size: imageSize,
        num_inference_steps: 4,
        ...(seed !== undefined ? { seed } : {}),
      },
    });

    console.log("[Fal] Raw Response:", response);

    const data = response as unknown as FalImageResponse;

    if (!data.images || data.images.length === 0) {
      throw new Error("No images returned from Fal.ai");
    }

    const imageUrl = data.images[0].url;

    if (!imageUrl) {
      throw new Error("Invalid image URL returned");
    }

    console.log("[Fal] Image URL:", imageUrl);

    return {
      imageUrl,
      seed: data.seed || seed || 0,
      model,
    };
  } catch (error) {
    console.error("[Fal] Generation Error:", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Fal.ai image generation failed"
    );
  }
}
