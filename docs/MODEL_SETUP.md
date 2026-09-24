# Proofline — Local Model Setup & Hardware Guidelines

Proofline is engineered to run locally with zero mandatory cloud subscriptions. You can use it in **Pure Sovereign Deterministic Mode** (zero AI models installed, 100% rule-based verifier) or pair it with **Local Gemma 4** running via Ollama.

---

## 1. Prerequisites & Hardware Requirements

| Configuration | Model Tag | Recommended RAM / VRAM | Min GPU | Inference Speed |
| :--- | :--- | :--- | :--- | :--- |
| **Ultra-Light** | `gemma4:e2b` (2B) | 8 GB System RAM / 2.5 GB VRAM | Apple M1 / Intel Iris / GTX 1650 | ~45–70 tokens/sec |
| **Recommended** | `gemma4:e4b` (4B) | 16 GB System RAM / 4.5 GB VRAM | Apple M2/M3 / RTX 3060 / 4060 | ~35–55 tokens/sec |
| **Deterministic** | *None (Rule Core)* | 2 GB System RAM / 0 MB VRAM | Any standard CPU | Instant (<10ms) |

---

## 2. Step-by-Step Setup with Ollama

### Step 1: Install Ollama
Download and install Ollama for your operating system:
- **macOS / Linux / Windows**: Download from [ollama.com](https://ollama.com).

### Step 2: Enforce Zero-Cloud Runtime
To guarantee that Ollama never routes requests to remote servers, launch the daemon with the cloud-disabled flag:

**On macOS / Linux**:
```bash
OLLAMA_NO_CLOUD=1 ollama serve
```

**On Windows (PowerShell)**:
```powershell
$env:OLLAMA_NO_CLOUD="1"
ollama serve
```

### Step 3: Pull the Sovereign Weights
In a separate terminal, pull your preferred Gemma 4 model variant:
```bash
# Recommended balance of reasoning and memory
ollama pull gemma4:e4b

# Or lightweight for mobile laptops
ollama pull gemma4:e2b
```

### Step 4: Verify Loopback Connectivity
Open your browser and navigate to:
```
http://127.0.0.1:11434/api/tags
```
You should see a JSON payload listing your installed models.

---

## 3. Connecting to Proofline

1. Launch Proofline locally:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:5173`.
3. Look at the **TopRail** model indicator:
   - When Ollama is running, the indicator pulses green: **"Local Gemma 4 Connected (gemma4:e4b)"**.
   - If Ollama is stopped, the indicator displays: **"Offline Mode (Deterministic Verifier)"**.
4. Click on **Model & Diagnostics** in the sidebar to view latency benchmarks, detected tags, and VRAM memory estimates.

---

## 4. Deterministic Offline Fallback

If you are on an air-gapped machine or choose not to run local model weights, **Proofline remains 100% operational**:
- The **Contradiction Discovery Engine** runs locally using rule-based propositional logic.
- The **Contract Reviewer** extracts clauses and evaluates playbook deviations using deterministic regex parsers and obligation matrices.
- The **Letter of Claim Generator** constructs fully verified CPR Annex B notices with exact character offsets.
- The **Rights Gate** evaluates data provider licenses strictly offline.
