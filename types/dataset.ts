import { DatasetCategory } from "./dataset_category";

export interface SkinDataset {
  id: number;
  filename: string;
  file_path: string;
  category_id: number;
  category?: DatasetCategory;
}

export interface SkinDatasetCreate {
  category_id: number;
  file: File;
}

export interface SkinDatasetUpdate {
  category_id?: number;
  file?: File;
}
