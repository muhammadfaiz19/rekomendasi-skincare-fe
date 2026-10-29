import fetcher from './fetcher';

export interface TrainLog {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'epoch';
}

export interface TrainStatus {
  status: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';
  is_training: boolean;
  progress: number;
  current_epoch: number;
  total_epochs: number;
  current_step: number;
  total_steps: number;
  metrics: {
    loss: number;
    accuracy: number;
    val_loss: number;
    val_accuracy: number;
  };
  logs: TrainLog[];
  error?: string | null;
  last_trained?: string | null;
  architecture: string;
  dataset_summary: {
    total_images?: number;
    categories?: Record<string, number>;
  };
  model_info: {
    exists: boolean;
    size_mb: number;
    last_modified: string | null;
  };
}

export interface DatasetSummary {
  total_images: number;
  categories: Record<string, number>;
  category_list: string[];
}

export const trainApi = {
  getStatus: () => fetcher<TrainStatus>('/train/status'),
  getDatasetSummary: () => fetcher<DatasetSummary>('/train/dataset-summary'),
  startTraining: (data: { epochs?: number; batch_size?: number; architecture?: string }) =>
    fetcher<TrainStatus>('/train/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  stopTraining: () =>
    fetcher<null>('/train/stop', {
      method: 'POST',
    }),
  resetTraining: () =>
    fetcher<TrainStatus>('/train/reset', {
      method: 'POST',
    }),
};
