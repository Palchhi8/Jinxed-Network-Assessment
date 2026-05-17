# Jinxed — Generative Media Studio 🌌

Jinxed is a state-of-the-art, high-fidelity AI Generative Media Studio. Designed as a production-grade asynchronous workspace, Jinxed empowers creators to formulate rich text prompts, tune advanced configurations (aspect ratios, seed mapping), authorize complex neural diffusion models, and catalog historical digital assets in real-time.

Built with a modern, visual dark-themed aesthetic, the system provides zero-latency gallery updates, detailed server logging, and graceful error boundaries, delivering a premium AI SaaS product experience.

---

## 🚀 Key Features

* **Real-time Async Generation Workflow:** Submits prompt queries, runs simulated multi-step Diffusion compute status bars on the frontend, and updates generation states dynamically.
* **Hugging Face Inference Core:** Integrated with Hugging Face’s SDK using a stable, free image generation model (`stabilityai/stable-diffusion-xl-base-1.0`) running 20 inference steps to synthesize beautiful assets without paid credits.
* **Direct Binary-to-Base64 Pipelines:** Converts raw binary image buffers returned by the neural API directly into self-contained base64 `data:image/png;base64` Data URLs, enabling instant client-side rendering and zero-cost database storage (no S3/bucket setups required).
* **Supabase PostgreSQL & Prisma 7 ORM:** Permanently catalogs asset records, seeds, aspect ratios, and tweak lineages.
* **Instant Gallery Synchronization:** Uses a state-based refresh architecture to dynamically prepend and sync new creations (both completed and failed records) to the UI gallery in real-time, eliminating manual page reloads.
* **Recall & Tweak Workspace:** Click "Tweak Parameters" on any card to smoothly scroll back to the studio console, instantly prepopulating all prompt configurations for rapid prompt engineering.
* **Polished Dark Glassmorphism Design:** Rounded-2xl grid structures, clean spacing, interactive hover image-zoom transitions, modern dark-themed loading shimmers, and minimalist toast notifications powered by `sonner`.

---

## 🛠️ Technology Stack

* **Frontend Framework:** Next.js 15 (App Router with React 19 Client State Management)
* **Styling & Theme:** Tailwind CSS & Vanilla CSS (Curated dark HSL palette, soft gradients, micro-animations)
* **Database & ORM:** Prisma ORM with Supabase (Direct PostgreSQL connection adapter)
* **AI Generation Provider:** Hugging Face Inference API (`@huggingface/inference`)
* **Icons & Notifications:** Lucide React & Sonner Toast Manager

---

## 📐 Architecture & System Design

```mermaid
sequenceDiagram
    autonumber
    actor User as Creator (Client)
    participant Next as Next.js API Route
    participant DB as Supabase PostgreSQL
    participant HF as Hugging Face Inference

    User->>Next: POST /api/generate { prompt, settings }
    activate Next
    Next->>DB: Prisma.create() [status = PROCESSING]
    activate DB
    DB-->>Next: Returns createdGenerationId
    deactivate DB
    Next->>HF: hf.textToImage("stabilityai/stable-diffusion-xl-base-1.0")
    activate HF
    HF-->>Next: Returns Binary Image Blob
    deactivate HF
    Next->>Next: Convert Blob arrayBuffer to Base64 Data URL
    Next->>DB: Prisma.update() [status = COMPLETED, imageUrl, seed]
    activate DB
    DB-->>Next: Returns updated Generation Object
    deactivate DB
    Next-->>User: Returns Generation JSON
    deactivate Next
    User->>User: Update React State & Trigger Sonner Success Toast
    User->>User: refreshGallery() -> Fetch latest creations
```

### 1. Asynchronous Workflow Design
To prevent blocked threads and client timeouts during multi-second AI inference:
* **Immediate Record Pinning:** The backend instantly creates a `Generation` database record with a `PROCESSING` state before querying Hugging Face.
* **Simulation Progress bars:** The frontend displays multi-stage loading cues ("Queueing task...", "Allocating GPU compute...", "Synthesizing pixel diffusion blocks...") for high-end product feedback.
* **Fail-Safe Transitions:** If Hugging Face is overloaded or rate-limited, the API route catches the exception, registers the record state as `FAILED`, and completes the response cleanly, ensuring the UI remains active and updates the gallery with failure cards gracefully.

### 2. Prisma Database Schema
The database models are designed for scaling and parameter recall lineage:

```prisma
enum GenerationStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

model Generation {
  id        String           @id @default(cuid())
  prompt    String
  imageUrl  String?          @db.Text
  status    GenerationStatus @default(PENDING)
  model     String
  settings  Json?
  parentId  String?
  parent    Generation?      @relation("TweakLineage", fields: [parentId], references: [id], onDelete: SetNull)
  children  Generation[]     @relation("TweakLineage")
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  @@index([createdAt(sort: Desc)])
  @@map("generations")
}
```
* **Self-Relation Lineage:** The `parentId` field establishes a powerful self-relation (`parent` / `children` tree) enabling the studio to track the entire tweak/regeneration history.
* **Base64 Storage:** The `imageUrl` is defined with `@db.Text` mapping to PostgreSQL's unstructured TEXT column, permitting high-capacity base64 encoding payloads.

---

## ⚙️ Environment Variables Setup

Create a [`.env`](file:///c:/Users/jainp/OneDrive/Desktop/Jinxed-Network-Assessment/.env) file in the root directory:

```ini
# Supabase PostgreSQL Direct Connection Link
DATABASE_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"

# Hugging Face Free Access Token
HUGGINGFACE_API_KEY="hf_your_free_access_token_here"
```

---

## ⚡ Setup & Local Execution

1. **Install Project Dependencies:**
   ```bash
   npm install
   ```

2. **Synchronize Prisma DB Schema:**
   ```bash
   npx prisma db push
   ```

3. **Launch the Development Server:**
   ```bash
   npm run dev
   ```

4. **Navigate to the Studio:**
   Open [http://localhost:3000](http://localhost:3000) inside your web browser.

---

## 🔮 Future Scalability Path

* **CDN Image Caching:** Migrate base64 Data URLs to Supabase Storage Buckets and serve them via a CDN (e.g. Cloudflare) to optimize network payloads for massive scale.
* **Websocket Progress Streams:** Introduce real-time server-sent events (SSE) or WebSockets to report precise epoch status updates directly from specialized GPU inference workers.
* **Regeneration Lineage Visualization:** Render interactive node-graph visuals in the UI to allow creators to explore their prompt engineering evolution trees.
