import { Injectable, Logger } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';

export interface LanguageConfig {
  language: string;
  locale: string;
  culturalContext: {
    formalityLevels: string[];
    relationshipTerms: Record<string, string[]>;
    ageBasedCommunication: Record<string, any>;
  };
  emotionKeywords: Record<string, any>;
  contextPatterns: Record<string, any>;
  intensityModifiers: {
    amplifiers: Record<string, string[]>;
    diminishers: Record<string, string[]>;
    punctuationPatterns: Record<string, string[]>;
  };
  culturalNuances: {
    relationshipStages: Record<string, any>;
    contextualRules: Record<string, any>;
  };
}

export interface PromptConfig {
  contextAnalysisPrompt: {
    systemMessage: string;
    template: string;
    availableEmotions: string[];
    availableContexts: string[];
    fewShotExamples: Array<{
      input: string;
      output: any;
    }>;
  };
  fallbackPrompt: {
    simple: string;
    backup: string;
    keywordExtraction: string;
  };
  promptOptimization: {
    maxRetries: number;
    timeoutMs: number;
    fallbackStrategy: string;
  };
}

@Injectable()
export class ConfigLoaderService {
  private readonly logger = new Logger(ConfigLoaderService.name);
  private languageConfigs: Map<string, LanguageConfig> = new Map();
  private promptConfig: PromptConfig;
  private lastLoaded: Date;
  private readonly configPath = join(__dirname, '../config');

  constructor() {
    this.loadConfigs();
  }

  /**
   * Load all configuration files
   */
  async loadConfigs(language: string = 'vietnamese'): Promise<void> {
    try {
      // Load language config
      await this.loadLanguageConfig(language);
      
      // Load prompt config
      await this.loadPromptConfig();
      
      this.lastLoaded = new Date();
      this.logger.log(`Configs loaded successfully for language: ${language}`);
    } catch (error) {
      this.logger.error(`Failed to load configs: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Load language-specific configuration
   */
  private async loadLanguageConfig(language: string): Promise<void> {
    const languageConfigPath = join(this.configPath, 'languages', `${language}.json`);
    
    try {
      const configData = await readFile(languageConfigPath, 'utf8');
      const config: LanguageConfig = JSON.parse(configData);
      
      if (this.validateLanguageConfig(config)) {
        this.languageConfigs.set(language, config);
        this.logger.debug(`Language config loaded: ${language}`);
      } else {
        throw new Error(`Invalid language config for: ${language}`);
      }
    } catch (error) {
      this.logger.error(`Failed to load language config ${language}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load prompt configuration
   */
  private async loadPromptConfig(): Promise<void> {
    const promptConfigPath = join(this.configPath, 'prompts', 'analysis-prompts.json');
    
    try {
      const configData = await readFile(promptConfigPath, 'utf8');
      const config: PromptConfig = JSON.parse(configData);
      
      if (this.validatePromptConfig(config)) {
        this.promptConfig = config;
        this.logger.debug('Prompt config loaded successfully');
      } else {
        throw new Error('Invalid prompt config');
      }
    } catch (error) {
      this.logger.error(`Failed to load prompt config: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get language configuration
   */
  getLanguageConfig(language: string = 'vietnamese'): LanguageConfig {
    const config = this.languageConfigs.get(language);
    if (!config) {
      this.logger.warn(`Language config not found: ${language}, using fallback`);
      return this.createFallbackLanguageConfig();
    }
    return config;
  }

  /**
   * Get prompt configuration
   */
  getPromptConfig(): PromptConfig {
    if (!this.promptConfig) {
      this.logger.warn('Prompt config not loaded, using fallback');
      return this.createFallbackPromptConfig();
    }
    return this.promptConfig;
  }

  /**
   * Reload configurations
   */
  async reloadConfigs(language: string = 'vietnamese'): Promise<void> {
    this.logger.log('Reloading configurations...');
    await this.loadConfigs(language);
  }

  /**
   * Validate language configuration
   */
  private validateLanguageConfig(config: any): boolean {
    const requiredFields = [
      'language',
      'locale',
      'culturalContext',
      'emotionKeywords',
      'contextPatterns',
      'intensityModifiers',
      'culturalNuances'
    ];

    return requiredFields.every(field => {
      const isValid = config && typeof config[field] !== 'undefined';
      if (!isValid) {
        this.logger.error(`Missing required field in language config: ${field}`);
      }
      return isValid;
    });
  }

  /**
   * Validate prompt configuration
   */
  private validatePromptConfig(config: any): boolean {
    const requiredFields = [
      'contextAnalysisPrompt',
      'fallbackPrompt',
      'promptOptimization'
    ];

    return requiredFields.every(field => {
      const isValid = config && typeof config[field] !== 'undefined';
      if (!isValid) {
        this.logger.error(`Missing required field in prompt config: ${field}`);
      }
      return isValid;
    });
  }

  /**
   * Create fallback language configuration
   */
  private createFallbackLanguageConfig(): LanguageConfig {
    return {
      language: 'english',
      locale: 'en-US',
      culturalContext: {
        formalityLevels: ['casual', 'formal'],
        relationshipTerms: {
          romantic: ['love', 'honey', 'dear'],
          casual: ['friend', 'buddy'],
          formal: ['sir', 'madam']
        },
        ageBasedCommunication: {}
      },
      emotionKeywords: {
        happy: { primary: ['happy', 'joy', 'glad'], slang: [], expressions: [], intensifiers: [] },
        sad: { primary: ['sad', 'cry', 'upset'], slang: [], expressions: [], intensifiers: [] }
      },
      contextPatterns: {},
      intensityModifiers: {
        amplifiers: { high: ['very', 'extremely'], medium: ['quite'], emphasis: ['!!!'] },
        diminishers: { low: ['a bit'], uncertain: ['maybe'] },
        punctuationPatterns: { excitement: ['!!!'], questioning: ['???'], love: ['❤️'], emphasis: ['CAPS'] }
      },
      culturalNuances: {
        relationshipStages: {},
        contextualRules: {}
      }
    };
  }

  /**
   * Create fallback prompt configuration
   */
  private createFallbackPromptConfig(): PromptConfig {
    return {
      contextAnalysisPrompt: {
        systemMessage: 'You are an emotion analysis AI.',
        template: 'Analyze: "{message}"',
        availableEmotions: ['happy', 'sad', 'neutral'],
        availableContexts: ['casual', 'formal'],
        fewShotExamples: []
      },
      fallbackPrompt: {
        simple: 'Emotion: ',
        backup: 'Analyze: ',
        keywordExtraction: 'Keywords: '
      },
      promptOptimization: {
        maxRetries: 1,
        timeoutMs: 5000,
        fallbackStrategy: 'simple'
      }
    };
  }

  /**
   * Get config metadata
   */
  getConfigMetadata(): {
    lastLoaded: Date;
    availableLanguages: string[];
    configPath: string;
  } {
    return {
      lastLoaded: this.lastLoaded,
      availableLanguages: Array.from(this.languageConfigs.keys()),
      configPath: this.configPath
    };
  }
}