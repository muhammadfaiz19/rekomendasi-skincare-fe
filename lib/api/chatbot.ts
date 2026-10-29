import fetcher from './fetcher';
import { ChatbotResponse } from '@/types/chatbot';

export const chatbotApi = {
  sendMessage: async (message: string) => {
    const response = await fetcher<ChatbotResponse>('/chatbot', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    return response;
  },
};
