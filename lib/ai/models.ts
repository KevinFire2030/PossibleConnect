export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "Gemini 2.0 Flash",
    description: "Google's fast and capable multimodal model",
  },
  {
    id: "chat-model-reasoning",
    name: "Gemini 2.0 Flash Thinking",
    description:
      "Uses advanced chain-of-thought reasoning for complex problems",
  },
];
