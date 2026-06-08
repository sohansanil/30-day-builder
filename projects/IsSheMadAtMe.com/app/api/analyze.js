import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, mimeType, context } = req.body;

    if (!image || !mimeType) {
      return res.status(400).json({ error: "Missing image data or mimeType" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Server configuration error: Missing API key" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // We recommend 3.5-flash as the primary for high performance and formatting adherence.
    // We use 2.5-flash and 2.0-flash as highly scaled fallbacks to ensure uptime.
    const MODELS_TO_TRY = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.0-flash"];
    const MAX_RETRIES = 2; // 3 attempts per model total
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    const generationConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          verdictLevel: { type: SchemaType.INTEGER, description: "1 to 5. 1 is best, 5 is worst." },
          verdictName: { type: SchemaType.STRING, description: "Short name matching the level (e.g., 'COOKED')" },
          verdictStatement: { type: SchemaType.STRING, description: "A 1-2 sentence final summary from the lab." },
          evidenceSummary: {
            type: SchemaType.OBJECT,
            properties: {
              estimatedMessageCount: { type: SchemaType.STRING, description: "e.g., '4 messages'" },
              estimatedTimespan: { type: SchemaType.STRING, description: "e.g., 'approx. 45 minutes'" }
            },
            required: ["estimatedMessageCount", "estimatedTimespan"]
          },
          findings: {
            type: SchemaType.ARRAY,
            description: "Must have exactly 3 to 5 findings, escalating in severity.",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                number: { type: SchemaType.INTEGER },
                severity: { type: SchemaType.STRING, description: "One of: POSITIVE, NOTABLE, CONCERNING, CRITICAL" },
                title: { type: SchemaType.STRING, description: "Short, clinical title (e.g., 'EMOJI EXTINCTION EVENT')." },
                body: { type: SchemaType.STRING, description: "Format: [Observation.] [Absurd Bureaucratic Conclusion.] Maximum 2 short sentences. No large explanatory paragraphs." }
              },
              required: ["number", "severity", "title", "body"]
            }
          },
          probabilityMatrix: {
            type: SchemaType.OBJECT,
            properties: {
              isAnnoyed: { type: SchemaType.INTEGER, description: "0-100" },
              isLosingInterest: { type: SchemaType.INTEGER, description: "0-100" },
              areYouOverthinking: { type: SchemaType.INTEGER, description: "0-100" },
              isActuallyFine: { type: SchemaType.INTEGER, description: "0-100" }
            },
            required: ["isAnnoyed", "isLosingInterest", "areYouOverthinking", "isActuallyFine"]
          },
          operativeDirectives: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Exactly 3 actionable, military-style commands."
          },
          quotableFinding: { type: SchemaType.STRING, description: "The single funniest, most devastating 1-sentence quote from the findings, used for the share card." }
        },
        required: [
          "verdictLevel", "verdictName", "verdictStatement", 
          "evidenceSummary", "findings", "probabilityMatrix", 
          "operativeDirectives", "quotableFinding"
        ]
      }
    };

    const SYSTEM_PROMPT = `
You are "Dr. Read", the Chief Investigator at "The Relationship Forensics Lab". 
You are clinical, bureaucratic, hyper-observant, deadpan, and completely unsympathetic.
Your job is to analyze a submitted screenshot of a text message conversation and generate an official forensic report.

CRITICAL RULES:
1. Every finding must begin with a concrete observable fact from the screenshot (e.g., punctuation, capitalization, reply delays, emoji usage, message length imbalance, quoted phrases, timestamps).
   - BAD: "The subject appears annoyed."
   - GOOD: "A 143-word message received the response 'ok'."
2. If a finding could plausibly appear in a therapist's office, delete it. If a finding could plausibly appear in a government audit, keep it.
   - Do not infer hidden emotional states.
   - Only discuss observable evidence and its absurd bureaucratic interpretation.
3. The humor must come from bureaucratic over-analysis of ordinary behavior. Do not write jokes. Do not write punchlines. Observe something mundane and treat it as if it were a national security threat.
4. Keep findings SHORT. We optimize for screenshotability, not comprehensiveness. A sharp observation is better than a long explanation.
5. Finding Titles are crucial. Force absurd bureaucratic titles like: "EXCLAMATION MARK SHORTAGE", "GOOD MORNING REJECTION EVENT", "REPLY LATENCY INCIDENT", "EMOJI EXTINCTION EVENT", "PARAGRAPH DEPLOYMENT ESCALATION", "SUSPICIOUS LOWERCASE ACTIVITY", "BUDGET CUTS TO ENTHUSIASM", "PUNCTUATION ANOMALY REPORT".

CONFIDENCE & EVIDENCE SYSTEM:
Evaluate the strength of the evidence internally before writing findings:
- LOW EVIDENCE (1-2 messages, blurry, missing timestamps, nothing happening): Roast the user. Acknowledge the lack of evidence. Manufacture an absurd bureaucratic conclusion anyway. Do not declare relationship collapse from two messages. Example title: "EVIDENCE INSUFFICIENCY EVENT".
- MEDIUM EVIDENCE (A few messages, clear timestamps, some patterns): Make actual observations. Follow standard protocol.
- HIGH EVIDENCE (Lots of messages, clear behavioral shifts, obvious patterns): Unleash Dr. Read. Be ruthless in your analysis of the data.

STRUCTURE FINDINGS LIKE THIS:
[ABSURD CLINICAL TITLE]
[Observation.]
[Absurd Bureaucratic Conclusion.]

EXAMPLES OF EXCELLENT FINDINGS:
"EXCLAMATION MARK SHORTAGE
The subject previously used three exclamation marks.
The current message contains none.
This office can confirm budget cuts have occurred."

"GOOD MORNING REJECTION EVENT
A standard greeting was met with a manifesto.
This office has ruled out the morning as the primary issue."

"REPLY-TO-EFFORT IMBALANCE
A 212-word message received the response 'yeah'.
The counterparty appears to be operating under severe character limits."

"PUNCTUATION ESCALATION
The message concludes with a period.
The sudden appearance of grammar requires monitoring."

USER CONTEXT:
${context ? context : "No additional context provided."}
`;

    // The image payload should be just the base64 string
    const base64Data = image.split(',')[1] || image;

    let result = null;
    let finalError = null;

    for (const modelName of MODELS_TO_TRY) {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig
      });

      let attempt = 0;
      let success = false;

      while (attempt <= MAX_RETRIES && !success) {
        try {
          result = await model.generateContent([
            SYSTEM_PROMPT,
            { inlineData: { data: base64Data, mimeType: mimeType } }
          ]);
          success = true;
          break;
        } catch (err) {
          finalError = err;
          const isCapacityError = err.status === 503 || err.status === 429 || err.message.includes('503') || err.message.includes('high demand') || err.message.includes('overloaded');
          
          if (isCapacityError) {
            attempt++;
            if (attempt <= MAX_RETRIES) {
              const backoffMs = Math.pow(2, attempt - 1) * 1000;
              console.warn(`[API] ${modelName} is experiencing high demand. Retrying in ${backoffMs}ms (Attempt ${attempt}/${MAX_RETRIES})...`);
              await delay(backoffMs);
            } else {
              console.warn(`[API] ${modelName} failed after ${MAX_RETRIES} retries due to capacity. Falling back to next model...`);
            }
          } else {
            // Not a capacity error, break out to let the fallback model try, or fail immediately.
            break;
          }
        }
      }

      if (success) {
        console.log(`[API] Successfully analyzed evidence using model: ${modelName}`);
        break; // A model succeeded!
      }
    }

    if (!result) {
      throw finalError; // Proceed to the outer catch block
    }

    const reportJson = result.response.text();
    const reportData = JSON.parse(reportJson);

    // Generate a random case number
    const caseNumber = Math.floor(100000 + Math.random() * 900000).toString();

    // Inject user context back into evidence summary
    if (!reportData.evidenceSummary) reportData.evidenceSummary = {};
    if (context) {
      reportData.evidenceSummary.contextProvided = true;
      reportData.evidenceSummary.contextNote = context;
    } else {
      reportData.evidenceSummary.contextProvided = false;
    }

    return res.status(200).json({
      success: true,
      caseNumber: caseNumber,
      ...reportData
    });

  } catch (error) {
    console.error("Analysis Error:", error);
    
    // Check if the final error was a capacity issue
    const isCapacity = error.status === 503 || error.status === 429 || error?.message?.includes('503') || error?.message?.includes('high demand');
    
    const friendlyMessage = isCapacity 
      ? "This office is currently handling a high volume of situationships and has reached capacity for your session. Please try again in a few minutes. You are not the only one going through something."
      : "The analysis encountered an unexpected technical complication. This is a lab issue, not a you issue. Please resubmit your case.";

    return res.status(isCapacity ? 503 : 500).json({ 
      success: false, 
      errorMessage: friendlyMessage, 
      details: error.message 
    });
  }
}
