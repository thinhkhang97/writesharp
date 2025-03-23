import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerationConfig } from '@google/generative-ai';

// Initialize the Gemini API client
const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }
  return apiKey;
};

// Create a new instance of the API each time to ensure it's server-side safe
export const getGeminiClient = () => {
  return new GoogleGenerativeAI(getApiKey());
};

// Configure safety settings
export const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Get the Gemini Flash 2.0 model
export const getGeminiModel = (generationConfig?: GenerationConfig) => {
  const client = getGeminiClient();
  return client.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings,
    generationConfig
  });
};

// Function to generate content with Gemini
export async function generateWithGemini(prompt: string, generationConfig?: GenerationConfig): Promise<string> {
  try {
    const model = getGeminiModel(generationConfig);
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw error;
  }
}

// Function to test if the Gemini API is properly configured
export async function testGeminiConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const testResponse = await generateWithGemini("Respond with 'Connection successful' if you can read this.");
    return {
      success: testResponse.includes("Connection successful"),
      message: testResponse
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      message: errorMessage
    };
  }
} 