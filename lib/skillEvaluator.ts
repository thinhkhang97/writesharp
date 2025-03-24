import { SkillEvaluation, SkillScores, WriterLevel, WriterProfile } from "./types";
import { getGeminiModel } from "./gemini";
import { SchemaType } from "@google/generative-ai";

/**
 * Analyzes draft content to evaluate writing skills using LLM
 */
export async function evaluateDraft(
  content: string,
  foundation: { purpose: string; audience: string; topic: string }
): Promise<SkillEvaluation> {
  // Perform LLM-based evaluation of writing skills
  const scores = await evaluateWithLLM(content, foundation);
  
  // Check originality (can be kept as is or enhanced with LLM)
  const originality = await checkOriginality(content);
  
  return {
    scores,
    originality,
    timestamp: new Date().toISOString()
  };
}

/**
 * Use LLM to evaluate writing skills
 */
async function evaluateWithLLM(
  content: string,
  foundation: { purpose: string; audience: string; topic: string }
): Promise<SkillScores> {
  // If content is empty, return zero scores
  if (!content.trim()) {
    return {
      clarity: 0,
      logic: 0,
      expression: 0,
      structure: 0,
      grammar: 0
    };
  }

  try {
    // Create foundation context string
    const foundationContext = `
      Purpose: ${foundation.purpose}
      Audience: ${foundation.audience}
      Topic: ${foundation.topic}
    `;

    // Prompt for the LLM to evaluate writing skills
    const prompt = `
    As a writing expert, evaluate the following text and provide scores for these specific writing skills:
    
    TEXT TO EVALUATE:
    """
    ${content}
    """
    
    CONTEXT (consider this when evaluating):
    """
    ${foundationContext}
    """
    
    EVALUATION INSTRUCTIONS:
    1. Evaluate the text on the following criteria, scoring each on a scale of 0-10:
       - Clarity: How clearly ideas are expressed (precise language, lack of ambiguity)
       - Logic: Quality of reasoning and logical flow between ideas
       - Expression: Vocabulary diversity, word choice, and overall expression
       - Structure: Organization with clear intro, body, and conclusion
       - Grammar: Correctness of grammar, spelling, and punctuation
    
    2. For each criterion:
       - Consider both strengths and weaknesses
       - The score should reflect overall proficiency (0=poor, 5=average, 10=excellent)
       - Short justification for each score (1-2 sentences max)
    
    3. Return structured data in the exact JSON format specified.
    `;

    // Configure Gemini to return structured data
    const model = getGeminiModel({
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          clarity: {
            type: SchemaType.OBJECT,
            properties: {
              score: { type: SchemaType.INTEGER },
              justification: { type: SchemaType.STRING }
            }
          },
          logic: {
            type: SchemaType.OBJECT,
            properties: {
              score: { type: SchemaType.INTEGER },
              justification: { type: SchemaType.STRING }
            }
          },
          expression: {
            type: SchemaType.OBJECT,
            properties: {
              score: { type: SchemaType.INTEGER },
              justification: { type: SchemaType.STRING }
            }
          },
          structure: {
            type: SchemaType.OBJECT,
            properties: {
              score: { type: SchemaType.INTEGER },
              justification: { type: SchemaType.STRING }
            }
          },
          grammar: {
            type: SchemaType.OBJECT,
            properties: {
              score: { type: SchemaType.INTEGER },
              justification: { type: SchemaType.STRING }
            }
          }
        },
        required: ["clarity", "logic", "expression", "structure", "grammar"]
      }
    });

    // Generate the evaluation
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    try {
      const evaluation = JSON.parse(responseText);
      
      // Extract scores from evaluation
      return {
        clarity: evaluation.clarity.score,
        logic: evaluation.logic.score,
        expression: evaluation.expression.score,
        structure: evaluation.structure.score,
        grammar: evaluation.grammar.score
      };
    } catch (error) {
      console.error("Error parsing LLM response:", error);
      // Fall back to basic scoring if parsing fails
      return fallbackScoring(content);
    }
  } catch (error) {
    console.error("Error with LLM evaluation:", error);
    // Fall back to basic scoring if LLM fails
    return fallbackScoring(content);
  }
}

/**
 * Simple fallback scoring method when LLM fails
 */
function fallbackScoring(content: string): SkillScores {
  // Simple scoring based on length as fallback
  const wordCount = content.trim().split(/\s+/).length;
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // Very basic fallback scores based on length and structure
  const baseScore = Math.min(7, Math.max(3, Math.floor(wordCount / 100)));
  
  return {
    clarity: baseScore,
    logic: baseScore,
    expression: baseScore,
    structure: Math.min(baseScore + 1, paragraphs.length),
    grammar: baseScore
  };
}

/**
 * Checks if content is likely to be original
 * This can also be enhanced with LLM for plagiarism detection
 */
async function checkOriginality(content: string): Promise<{ isOriginal: boolean; matchPercentage?: number }> {
  // In a future enhancement, this could use AI to detect plagiarism
  // For now, we'll use a simple implementation
  if (content.length === 0) {
    return { isOriginal: true };
  }
  
  // Mock implementation - returning as original
  // In a real implementation, this would check against databases or use AI
  return { isOriginal: true };
}

/**
 * Calculate writer profile based on evaluation history
 */
export function calculateWriterProfile(evaluations: SkillEvaluation[]): WriterProfile {
  if (evaluations.length === 0) {
    return {
      reasonerScore: 0,
      polisherScore: 0,
      level: 'Beginner',
      history: []
    };
  }
  
  // Use up to the last 3 evaluations to calculate the profile
  const recentEvaluations = evaluations.slice(-3);
  
  // Calculate reasoner score (clarity, logic, expression)
  const reasonerScores = recentEvaluations.map(evaluation => {
    return (evaluation.scores.clarity + evaluation.scores.logic + evaluation.scores.expression) / 3;
  });
  const reasonerScore = reasonerScores.reduce((sum, score) => sum + score, 0) / reasonerScores.length;
  
  // Calculate polisher score (structure, grammar)
  const polisherScores = recentEvaluations.map(evaluation => {
    return (evaluation.scores.structure + evaluation.scores.grammar) / 2;
  });
  const polisherScore = polisherScores.reduce((sum, score) => sum + score, 0) / polisherScores.length;
  
  // Determine writer level
  const level = determineWriterLevel(reasonerScore, polisherScore);
  
  // Create history entries
  const history = evaluations.map(evaluation => {
    const rScore = (evaluation.scores.clarity + evaluation.scores.logic + evaluation.scores.expression) / 3;
    const pScore = (evaluation.scores.structure + evaluation.scores.grammar) / 2;
    
    return {
      timestamp: evaluation.timestamp,
      reasonerScore: rScore,
      polisherScore: pScore
    };
  });
  
  return {
    reasonerScore: Math.round(reasonerScore * 10) / 10,
    polisherScore: Math.round(polisherScore * 10) / 10,
    level,
    history
  };
}

/**
 * Determine writer level based on reasoner and polisher scores
 */
function determineWriterLevel(reasonerScore: number, polisherScore: number): WriterLevel {
  const avgScore = (reasonerScore + polisherScore) / 2;
  
  if (avgScore >= 8.5) return 'Expert';
  if (avgScore >= 7) return 'Advanced';
  if (avgScore >= 5) return 'Solid';
  return 'Beginner';
} 