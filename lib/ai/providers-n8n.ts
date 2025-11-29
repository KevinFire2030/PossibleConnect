import { customProvider } from "ai";
import { isTestEnvironment } from "../constants";
import type { LanguageModel } from "ai";

// n8n 웹훅 URL (환경 변수에서 가져오기)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/your-workflow-id";

// n8n 웹훅으로 요청을 보내는 커스텀 모델 생성
const createN8nModel = () => {  // 반환 타입 제거
  return {
    specificationVersion: "v2",
    provider: "n8n",
    modelId: "n8n-ai-agent",
    defaultObjectGenerationMode: "tool",
    supportedUrls: [],
    supportsImageUrls: false,
    supportsStructuredOutputs: false,
    doGenerate: async (_options: unknown) => {
      // 타입 안전성을 위해 any로 캐스팅
      const options = _options as {
        prompt?: string;
        messages?: unknown[];
        system?: string;
      };

      // n8n 웹훅으로 요청 전송
      console.log("Sending request to n8n:", {
        url: N8N_WEBHOOK_URL,
        body: {
          prompt: options.prompt,
          messages: options.messages,
          system: options.system,
        },
      });

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          prompt: options.prompt,
          messages: options.messages,
          system: options.system,
        }),
      });

      console.log("n8n response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`n8n webhook failed: ${response.status} ${errorText}`);
      }

      // 응답 본문을 텍스트로 먼저 가져오기
      const responseText = await response.text();
      
      // 빈 응답 체크
      if (!responseText || responseText.trim() === "") {
        throw new Error("n8n webhook returned empty response");
      }

      // JSON 파싱 시도
      let parsedData: unknown;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse n8n response:", responseText);
        throw new Error(`n8n webhook returned invalid JSON: ${responseText.substring(0, 100)}`);
      }

      // 재귀적으로 output, response, text, message 필드 찾기
      const findResponseText = (obj: unknown): string | null => {
        if (obj === null || obj === undefined) return null;
        
        if (typeof obj === "string") return obj;
        
        if (typeof obj === "object") {
          if (Array.isArray(obj)) {
            for (const item of obj) {
              const result = findResponseText(item);
              if (result) return result;
            }
            return null;
          }
          
          const objRecord = obj as Record<string, unknown>;
          
          if (typeof objRecord.output === "string") return objRecord.output;
          if (typeof objRecord.response === "string") return objRecord.response;
          if (typeof objRecord.text === "string") return objRecord.text;
          if (typeof objRecord.message === "string") return objRecord.message;
          
          for (const value of Object.values(objRecord)) {
            const result = findResponseText(value);
            if (result) return result;
          }
        }
        
        return null;
      };

      // 배열인 경우 첫 번째 항목 사용, 객체인 경우 그대로 사용
      const data = Array.isArray(parsedData) ? parsedData[0] : parsedData;
      
      // 재귀적으로 응답 텍스트 찾기
      const responseTextValue = findResponseText(parsedData) || "";

      // 디버깅: 최종 추출된 텍스트 로그
      console.log("n8n response text value:", responseTextValue);
      console.log("n8n response text length:", responseTextValue.length);

      if (!responseTextValue || responseTextValue.trim() === "") {
        console.error("n8n response is empty! Full data:", JSON.stringify(parsedData, null, 2));
        throw new Error("n8n webhook returned empty response text");
      }

      // 토큰 정보 추출 (원본 데이터에서)
      const inputTokens = 
        (data as { inputTokens?: number }).inputTokens ||
        (data as { usage?: { inputTokens?: number } }).usage?.inputTokens ||
        0;
      
      const outputTokens = 
        (data as { outputTokens?: number }).outputTokens ||
        (data as { usage?: { outputTokens?: number } }).usage?.outputTokens ||
        0;
      
      return {
        rawCall: { rawPrompt: null, rawSettings: {} },
        finishReason: "stop",
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        content: [{ type: "text", text: responseTextValue }],
        warnings: [],
      };
    },
    doStream: async (_options: unknown) => {
      // 타입 안전성을 위해 any로 캐스팅
      const options = _options as {
        prompt?: string;
        messages?: unknown[];
        system?: string;
      };

      // n8n 웹훅으로 요청 전송
      console.log("Sending request to n8n:", {
        url: N8N_WEBHOOK_URL,
        body: {
          prompt: options.prompt,
          messages: options.messages,
          system: options.system,
        },
      });

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          prompt: options.prompt,
          messages: options.messages,
          system: options.system,
        }),
      });

      console.log("n8n response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`n8n webhook failed: ${response.status} ${errorText}`);
      }

      // 응답 본문을 텍스트로 먼저 가져오기
      const responseText = await response.text();
      
      // 빈 응답 체크
      if (!responseText || responseText.trim() === "") {
        throw new Error("n8n webhook returned empty response");
      }

      // JSON 파싱 시도
      let parsedData: unknown;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse n8n response:", responseText);
        throw new Error(`n8n webhook returned invalid JSON: ${responseText.substring(0, 100)}`);
      }

      // 재귀적으로 output, response, text, message 필드 찾기
      const findResponseText = (obj: unknown): string | null => {
        if (obj === null || obj === undefined) return null;
        
        if (typeof obj === "string") return obj;
        
        if (typeof obj === "object") {
          if (Array.isArray(obj)) {
            for (const item of obj) {
              const result = findResponseText(item);
              if (result) return result;
            }
            return null;
          }
          
          const objRecord = obj as Record<string, unknown>;
          
          if (typeof objRecord.output === "string") return objRecord.output;
          if (typeof objRecord.response === "string") return objRecord.response;
          if (typeof objRecord.text === "string") return objRecord.text;
          if (typeof objRecord.message === "string") return objRecord.message;
          
          for (const value of Object.values(objRecord)) {
            const result = findResponseText(value);
            if (result) return result;
          }
        }
        
        return null;
      };

      // 응답 텍스트 추출
      const responseTextValue = findResponseText(parsedData) || "";

      if (!responseTextValue || responseTextValue.trim() === "") {
        throw new Error("n8n webhook returned empty response text");
      }

      // 토큰 정보 추출
      const data = Array.isArray(parsedData) ? parsedData[0] : parsedData;
      const inputTokens = 
        (data as { inputTokens?: number }).inputTokens ||
        (data as { usage?: { inputTokens?: number } }).usage?.inputTokens ||
        0;
      const outputTokens = 
        (data as { outputTokens?: number }).outputTokens ||
        (data as { usage?: { outputTokens?: number } }).usage?.outputTokens ||
        0;

      // 스트림 생성 (올바른 형식으로)
      const streamId = "n8n";
      const words = responseTextValue.split(/(\s+)/);
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // text-start 이벤트
            controller.enqueue({
              id: streamId,
              type: "text-start",
            });

            // 단어 단위로 text-delta 이벤트
            for (const word of words) {
              if (word) {
                controller.enqueue({
                  id: streamId,
                  type: "text-delta",
                  delta: word,
                });
                // 자연스러운 스트리밍 효과를 위한 작은 지연
                await new Promise((resolve) => setTimeout(resolve, 10));
              }
            }

            // text-end 이벤트
            controller.enqueue({
              id: streamId,
              type: "text-end",
            });

            // finish 이벤트
            controller.enqueue({
              type: "finish",
              finishReason: "stop",
              usage: {
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
              },
            });

            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return {
        stream,
        rawCall: { rawPrompt: null, rawSettings: {} },
      };
    },
  } as unknown as LanguageModel;
};

// 모델 인스턴스 생성
const n8nChatModel = createN8nModel() as LanguageModel;
const n8nReasoningModel = createN8nModel() as LanguageModel;
const n8nTitleModel = createN8nModel() as LanguageModel;
const n8nArtifactModel = createN8nModel() as LanguageModel;

export const n8nProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        "chat-model": n8nChatModel as any,
        "chat-model-reasoning": n8nReasoningModel as any,
        "title-model": n8nTitleModel as any,
        "artifact-model": n8nArtifactModel as any,
      },
    });
