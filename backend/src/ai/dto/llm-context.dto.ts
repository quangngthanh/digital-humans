import { ContextType, EmotionType } from "@/chat/dto/emotional-intent.dto";
import { ConversationContext } from "../context-analyzer.service";

export interface LLMAnalysisRequest {
    message: string;
    language: string;
    previousContext?: ConversationContext;
    userId?: string;
  }
  
  export interface LLMAnalysisResponse {
    emotion: EmotionType;
    intensity: number;
    context: ContextType;
    relationshipTone: string;
    keywords: string[];
    culturalContext: string;
    confidence: number;
    processingTime: number;
    fallbackUsed: boolean;
  }