import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { LanguageModel } from "ai";
import {
  AIProvider,
  retrieveAIKeyConfig,
} from "@/lib/security/secure-vault";

export interface OracleModelResolution {
  model: LanguageModel;
  provider: AIProvider;
  modelId: string;
  source: "vault" | "env";
}

export interface OracleResolutionOptions {
  preferredProvider?: AIProvider;
  modelOverride?: string;
}

/**
 * Resolves an active language model instance using the Vercel AI SDK.
 * Cascades through the user's configured BYOK keys in the secure vault,
 * falling back to server environment variables if available.
 */
export async function resolveOracleModel(
  options: OracleResolutionOptions = {}
): Promise<OracleModelResolution | null> {
  const providerPriority: AIProvider[] = [
    ...(options.preferredProvider ? [options.preferredProvider] : []),
    "gemini",
    "deepseek",
    "openrouter",
    "openai",
    "anthropic",
    "custom",
  ];

  // Deduplicate provider list while keeping preferred provider first
  const seen = new Set<AIProvider>();
  const candidates = providerPriority.filter((p) => {
    if (seen.has(p)) return false;
    seen.add(p);
    return true;
  });

  for (const provider of candidates) {
    // 1. Check local secure vault
    const vaultConfig = await retrieveAIKeyConfig(provider);
    if (vaultConfig && vaultConfig.apiKey) {
      const model = createProviderModel(provider, vaultConfig.apiKey, {
        endpoint: vaultConfig.endpoint,
        modelId: options.modelOverride || vaultConfig.model,
      });
      if (model) {
        return {
          model,
          provider,
          modelId: options.modelOverride || vaultConfig.model || "default",
          source: "vault",
        };
      }
    }

    // 2. Fall back to process.env
    const envKey = getEnvKeyForProvider(provider);
    if (envKey) {
      const model = createProviderModel(provider, envKey, {
        endpoint: getEnvEndpointForProvider(provider),
        modelId: options.modelOverride || getEnvModelForProvider(provider),
      });
      if (model) {
        return {
          model,
          provider,
          modelId: options.modelOverride || getEnvModelForProvider(provider) || "default",
          source: "env",
        };
      }
    }
  }

  return null;
}

/**
 * Instantiates the appropriate Vercel AI SDK provider model adapter.
 */
function createProviderModel(
  provider: AIProvider,
  apiKey: string,
  options: { endpoint?: string; modelId?: string } = {}
): LanguageModel | null {
  try {
    switch (provider) {
      case "gemini": {
        const google = createGoogleGenerativeAI({ apiKey });
        const modelName = options.modelId || "gemini-2.5-flash";
        return google(modelName);
      }

      case "openai": {
        const openai = createOpenAI({ apiKey });
        const modelName = options.modelId || "gpt-4o";
        return openai(modelName);
      }

      case "anthropic": {
        const anthropic = createAnthropic({ apiKey });
        const modelName = options.modelId || "claude-3-5-sonnet-20241022";
        return anthropic(modelName);
      }

      case "deepseek": {
        const deepseek = createOpenAI({
          baseURL: options.endpoint || "https://api.deepseek.com",
          apiKey,
        });
        const modelName = options.modelId || "deepseek-chat";
        return deepseek(modelName);
      }

      case "openrouter": {
        const openrouter = createOpenAI({
          baseURL: options.endpoint || "https://openrouter.ai/api/v1",
          apiKey,
        });
        const modelName = options.modelId || "google/gemini-2.5-flash";
        return openrouter(modelName);
      }

      case "custom": {
        const custom = createOpenAI({
          baseURL: options.endpoint || "http://localhost:11434/v1",
          apiKey: apiKey || "not-required",
        });
        const modelName = options.modelId || "llama3";
        return custom(modelName);
      }

      default:
        return null;
    }
  } catch (err) {
    console.warn(`Failed to initialize provider ${provider}:`, err);
    return null;
  }
}

function getEnvKeyForProvider(provider: AIProvider): string | null {
  switch (provider) {
    case "gemini":
      return process.env.GEMINI_API_KEY || null;
    case "openai":
      return process.env.OPENAI_API_KEY || null;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY || null;
    case "deepseek":
      return process.env.DEEPSEEK_API_KEY || null;
    case "openrouter":
      return process.env.OPENROUTER_API_KEY || null;
    case "custom":
      return process.env.CUSTOM_AI_KEY || null;
    default:
      return null;
  }
}

function getEnvEndpointForProvider(provider: AIProvider): string | undefined {
  switch (provider) {
    case "deepseek":
      return process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
    case "openrouter":
      return process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
    case "custom":
      return process.env.CUSTOM_AI_BASE_URL || "http://localhost:11434/v1";
    default:
      return undefined;
  }
}

function getEnvModelForProvider(provider: AIProvider): string | undefined {
  switch (provider) {
    case "gemini":
      return process.env.GEMINI_MODEL || "gemini-2.5-flash";
    case "openai":
      return process.env.OPENAI_MODEL || "gpt-4o";
    case "anthropic":
      return process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
    case "deepseek":
      return process.env.DEEPSEEK_MODEL || "deepseek-chat";
    case "openrouter":
      return process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
    case "custom":
      return process.env.CUSTOM_AI_MODEL || "llama3";
    default:
      return undefined;
  }
}
