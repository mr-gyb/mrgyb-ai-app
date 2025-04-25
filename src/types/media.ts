export interface MediaContent {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  content_type: 'video' | 'audio' | 'image' | 'document' | 'link';
  original_url: string | null;
  storage_path: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MediaTranscription {
  id: string;
  media_id: string;
  content: string;
  language: string;
  created_at: string;
}

export interface MediaDerivative {
  id: string;
  media_id: string;
  derivative_type: 'blog' | 'summary' | 'headline' | 'seo_tags' | 'audio' | 'video' | 'image';
  content: string | null;
  storage_path: string | null;
  metadata: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface MediaTag {
  id: string;
  media_id: string;
  tag: string;
  created_at: string;
}

export interface MediaUploadResult {
  id: string;
  url: string;
  type: string;
}

export interface MediaProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
}