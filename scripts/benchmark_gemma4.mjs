import http from 'http';

const model = 'gemma4:e2b-it-qat';
const prompt = 'State the definition of the tort of negligence under English common law and cite the leading landmark House of Lords authority.';

console.log(`Sending benchmark inference request to model: ${model}`);
console.log(`Prompt: "${prompt}"\n`);

const startTime = Date.now();
let firstTokenTime = null;

const req = http.request(
  {
    hostname: '127.0.0.1',
    port: 11434,
    path: '/api/generate',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  },
  (res) => {
    let fullResponse = '';
    let evalCount = 0;
    let evalDuration = 0;
    let promptEvalDuration = 0;

    res.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.response) {
            if (!firstTokenTime) {
              firstTokenTime = Date.now();
            }
            fullResponse += data.response;
          }
          if (data.done) {
            evalCount = data.eval_count || 0;
            evalDuration = data.eval_duration || 0; // nanoseconds
            promptEvalDuration = data.prompt_eval_duration || 0; // nanoseconds
          }
        } catch (e) {}
      }
    });

    res.on('end', () => {
      const totalTimeMs = Date.now() - startTime;
      const ttfbMs = firstTokenTime ? firstTokenTime - startTime : null;
      const tokensPerSec = evalDuration > 0 ? (evalCount / (evalDuration / 1e9)).toFixed(2) : 'N/A';

      console.log('=== GEMMA 4 BENCHMARK RESULT ===');
      console.log(`Model: ${model}`);
      console.log(`Total Latency: ${totalTimeMs} ms`);
      console.log(`Time to First Token (TTFT): ${ttfbMs} ms`);
      console.log(`Prompt Eval Duration: ${(promptEvalDuration / 1e6).toFixed(2)} ms`);
      console.log(`Generated Tokens: ${evalCount}`);
      console.log(`Eval Duration: ${(evalDuration / 1e6).toFixed(2)} ms`);
      console.log(`Throughput: ${tokensPerSec} tokens/sec`);
      console.log('\nGenerated Response:');
      console.log('--------------------------------------------------');
      console.log(fullResponse);
      console.log('--------------------------------------------------');
    });
  }
);

req.on('error', (e) => {
  console.error(`Request failed: ${e.message}`);
});

req.write(JSON.stringify({
  model: model,
  prompt: prompt,
  stream: true,
  options: {
    temperature: 0.1,
    top_p: 0.9
  }
}));

req.end();
