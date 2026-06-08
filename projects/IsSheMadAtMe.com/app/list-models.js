import fs from 'fs';
import https from 'https';

// Read .env
const envFile = fs.readFileSync('.env', 'utf-8');
const match = envFile.match(/GEMINI_API_KEY="?([^"\n]+)"?/);
if (!match) {
  console.error("Could not find GEMINI_API_KEY in .env");
  process.exit(1);
}
const apiKey = match[1];

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.models) {
        console.log("Available Models:");
        parsed.models.forEach(m => {
          if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
             console.log(`- ${m.name} (Version: ${m.version})`);
          }
        });
      } else {
        console.log("Response:", parsed);
      }
    } catch (e) {
      console.error("Parse error:", e);
      console.log("Raw data:", data);
    }
  });
}).on('error', err => {
  console.error("HTTP Error:", err);
});
