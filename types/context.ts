export type ChatbotContext = {
  id: number;
  name: string;
  context: string;
  created_at: string;
  updated_at: string;
};

export type ChatbotContextUpdate = {
  context: string;
};

export type ChatbotFile = {
  id: number;
  filename: string;
  file_path: string;
  file_url: string;
  content: string;
  created_at: string;
  updated_at: string;
};
