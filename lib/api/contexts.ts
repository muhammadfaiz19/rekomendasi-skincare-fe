import fetcher from './fetcher';
import { ChatbotContext, ChatbotContextUpdate, ChatbotFile } from '@/types/context';

export const chatbotContextApi = {
  // Main Text Context
  getContext: async (name: string = "glamora") => {
    const response = await fetcher<ChatbotContext | null>(`/contexts/${name}`);
    return response;
  },
  
  updateContext: async (name: string = "glamora", data: ChatbotContextUpdate) => {
    const response = await fetcher<ChatbotContext>(`/contexts/${name}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  },
  
  // Files Context
  listFiles: async () => {
    const response = await fetcher<ChatbotFile[]>('/chatbot/files');
    return response;
  },
  
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetcher<ChatbotFile>('/chatbot/files', {
      method: 'POST',
      body: formData,
    });
    return response;
  },
  
  deleteFile: async (id: number) => {
    const response = await fetcher<void>(`/chatbot/files/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};
