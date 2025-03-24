import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerationConfig, SchemaType } from '@google/generative-ai';

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

export interface WritingReviewFeedback {
  score: number;
  strengths: {
    points: string[];
    summary: string;
  };
  weaknesses: {
    points: string[];
    summary: string;
  };
}

export async function generateWritingReview(
  content: string,
  foundation?: string,
  ideas?: string
): Promise<WritingReviewFeedback> {
  try {
    const prompt = `
    Review the following piece of writing. Focus on the reasoning (logic flow) and expression (word impact, clarity).

    ${foundation ? `FOUNDATION/CONTEXT:
    ${foundation}` : ''}
    
    ${ideas ? `KEY IDEAS:
    ${ideas}` : ''}
    
    CONTENT TO REVIEW:
    ${content}
    
   
    
    INSTRUCTIONS:
    Provide feedback
    
    IMPORTANT GUIDELINES:
    1. Include 0-5 specific strengths with direct quotes from the text that align with the foundation and ideas provided
    2. Include 0-5 specific weaknesses with direct quotes from the text
    3. For each point, explain how it impacts reasoning (logic flow) or expression (word impact, clarity)
    4. If foundation or ideas are provided, evaluate how well the content addresses these elements
    5. Keep each point concise, short in 20 words or less and detailed enough to be helpful
    6. Score the content between 0 and 100 based on the strength and weaknesses
    `;

    const model = getGeminiModel({
      responseMimeType: "application/json",
      responseSchema: {
        description: "A JSON object with strengths and weaknesses",
        type: SchemaType.OBJECT,
        properties: {
          score: {
            type: SchemaType.INTEGER,
            description: "Score between 0 and 100",
          },
          strengths: {
            type: SchemaType.OBJECT,
            properties: {
              points: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.STRING,
                  description: "Specific example of clear language with direct quote",
                },
              },
              summary: {
                type: SchemaType.STRING,
                description: "1-2 sentence summary of key strengths",
              },
            },
          },
          weaknesses: {
            type: SchemaType.OBJECT,
            properties: {
              points: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.STRING,
                  description: "Specific example of unclear language with direct quote and suggestion",
                },
              },
              summary: {
                type: SchemaType.STRING,
                description: "1-2 sentence summary of areas to improve",
              },
            },
          },
        },
        required: ["score", "strengths", "weaknesses"],
      },
    });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    try {
      return JSON.parse(responseText) as WritingReviewFeedback;
    } catch (parseError) {
      console.error('Error parsing Gemini response as JSON:', parseError);
      
      // Fallback response if parsing fails
      return {
        score: 0,
        strengths: {
          points: ["Could not generate specific feedback. Please try again."],
          summary: "Error processing feedback."
        },
        weaknesses: {
          points: ["Could not generate specific feedback. Please try again."],
          summary: "Error processing feedback."
        }
      };
    }
  } catch (error) {
    console.error('Error generating writing review with Gemini:', error);
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