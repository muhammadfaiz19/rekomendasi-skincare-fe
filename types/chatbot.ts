import { Product } from "./product";

export type ChatbotResponse = {
  reasoning: string;
  answer: string;
  recommended_products: Product[];
};

export type ChatbotMessageRequest = {
  message: string;
};
