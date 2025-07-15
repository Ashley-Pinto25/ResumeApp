import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ResumeAnalysis } from '../types';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const geminiService = {
  async analyzeResume(resumeText: string, retryCount = 0): Promise<ResumeAnalysis> {
    const maxRetries = 2;
    const retryDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
    
    try {
      // Use the current Gemini model name
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });
      
      const prompt = `
        Analyze the following resume and provide structured feedback. Return a JSON response with the following structure:
        {
          "strengths": ["strength1", "strength2", ...],
          "weaknesses": ["weakness1", "weakness2", ...],
          "missingSections": ["missing1", "missing2", ...],
          "suggestions": ["suggestion1", "suggestion2", ...],
          "overallScore": 85,
          "summary": "A brief summary of the resume analysis"
        }
        
        Please analyze these key areas:
        1. Overall structure and formatting
        2. Professional experience relevance
        3. Skills and qualifications
        4. Education background
        5. Contact information completeness
        6. Achievement quantification
        7. Keyword optimization
        8. Grammar and clarity
        
        Resume Text:
        ${resumeText}
        
        Provide specific, actionable feedback and rate the resume on a scale of 1-100.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysisData = JSON.parse(jsonMatch[0]);
          return {
            strengths: analysisData.strengths || [],
            weaknesses: analysisData.weaknesses || [],
            missingSections: analysisData.missingSections || [],
            suggestions: analysisData.suggestions || [],
            overallScore: analysisData.overallScore || 0,
            summary: analysisData.summary || 'Analysis completed',
            analyzedAt: new Date(),
          };
        }
      } catch {
        console.warn('Failed to parse JSON response, using fallback');
      }
      
      // Fallback parsing if JSON parsing fails
      return this.parseTextResponse(text);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      
      // Handle specific error types with retry logic
      if (error instanceof Error) {
        // Handle 503 Service Unavailable (overloaded) with retry
        if (error.message.includes('503') || error.message.includes('overloaded')) {
          if (retryCount < maxRetries) {
            console.log(`Gemini API overloaded, retrying in ${retryDelay(retryCount)}ms... (attempt ${retryCount + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay(retryCount)));
            return this.analyzeResume(resumeText, retryCount + 1);
          } else {
            console.log('Max retries reached, providing fallback analysis');
            return this.createFallbackAnalysis(resumeText);
          }
        }
        
        // Handle other specific errors
        if (error.message.includes('API key')) {
          throw new Error('Invalid Gemini API key. Please check your configuration.');
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          throw new Error('API quota exceeded. Please try again later.');
        } else if (error.message.includes('model')) {
          throw new Error('AI model unavailable. Please try again later.');
        } else if (error.message.includes('404')) {
          throw new Error('AI service temporarily unavailable. Please try again later.');
        }
      }
      
      throw new Error('Failed to analyze resume. Please try again.');
    }
  },

  parseTextResponse(text: string): ResumeAnalysis {
    const strengths = this.extractListFromText(text, 'strength');
    const weaknesses = this.extractListFromText(text, 'weakness');
    const missingSections = this.extractListFromText(text, 'missing');
    const suggestions = this.extractListFromText(text, 'suggestion');
    
    // Extract overall score
    const scoreMatch = text.match(/(\d+)(?:\/100|%|\s*(?:out of|score))/i);
    const overallScore = scoreMatch ? parseInt(scoreMatch[1]) : 75;
    
    return {
      strengths,
      weaknesses,
      missingSections,
      suggestions,
      overallScore,
      summary: text.substring(0, 200) + '...',
      analyzedAt: new Date(),
    };
  },

  extractListFromText(text: string, keyword: string): string[] {
    const regex = new RegExp(`${keyword}[s]?:?\\s*([^\\n]*(?:\\n[^\\n]*){0,5})`, 'gi');
    const matches = text.match(regex);
    
    if (!matches) return [];
    
    const items: string[] = [];
    matches.forEach(match => {
      const lines = match.split('\n');
      lines.forEach(line => {
        const cleaned = line.replace(/^\s*[-•*]\s*/, '').trim();
        if (cleaned && !cleaned.match(/^(strength|weakness|missing|suggestion)/i)) {
          items.push(cleaned);
        }
      });
    });
    
    return items.slice(0, 5); // Limit to 5 items
  },

  // Test function to verify API connectivity
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent('Test connection. Respond with "Connection successful".');
      const response = await result.response;
      response.text(); // Just verify we can get the response
      
      return { 
        success: true, 
        error: undefined 
      };
    } catch (error) {
      console.error('Gemini API connection test failed:', error);
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  // Fallback analysis when AI service is unavailable
  async createFallbackAnalysis(resumeText: string): Promise<ResumeAnalysis> {
    console.log('Creating fallback analysis due to AI service unavailability');
    
    const wordCount = resumeText.split(/\s+/).length;
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
    const hasPhone = /[+]?[1-9][\d]{3,14}/.test(resumeText);
    const hasEducation = /education|degree|university|college|school/i.test(resumeText);
    const hasExperience = /experience|work|job|position|role/i.test(resumeText);
    const hasSkills = /skills|technologies|proficient|familiar/i.test(resumeText);
    
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const missingSections: string[] = [];
    const suggestions: string[] = [];
    
    // Basic analysis based on text content
    if (wordCount > 200) {
      strengths.push('Resume has substantial content');
    } else {
      weaknesses.push('Resume appears to be quite brief');
    }
    
    if (hasEmail && hasPhone) {
      strengths.push('Contact information is present');
    } else {
      missingSections.push('Complete contact information');
      suggestions.push('Ensure both email and phone number are included');
    }
    
    if (hasEducation) {
      strengths.push('Education section is present');
    } else {
      missingSections.push('Education background');
    }
    
    if (hasExperience) {
      strengths.push('Work experience is mentioned');
    } else {
      missingSections.push('Professional experience');
    }
    
    if (hasSkills) {
      strengths.push('Skills section is included');
    } else {
      missingSections.push('Skills and competencies');
    }
    
    // Default suggestions
    suggestions.push('Consider having your resume professionally reviewed');
    suggestions.push('Ensure all sections are clearly organized and formatted');
    suggestions.push('Quantify achievements with specific numbers and results');
    
    let overallScore = 50; // Base score
    if (hasEmail && hasPhone) overallScore += 10;
    if (hasEducation) overallScore += 10;
    if (hasExperience) overallScore += 15;
    if (hasSkills) overallScore += 10;
    if (wordCount > 200) overallScore += 5;
    
    return {
      strengths,
      weaknesses,
      missingSections,
      suggestions,
      overallScore,
      summary: 'Basic analysis completed. For detailed AI-powered feedback, please try again when the service is available.',
      analyzedAt: new Date(),
    };
  },
};
