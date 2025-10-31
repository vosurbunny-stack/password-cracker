
export type AnalysisStatus = 'idle' | 'analyzing' | 'found' | 'not_found' | 'error';

export interface AnalysisResult {
  status: AnalysisStatus;
  inputHash: string;
  password?: string;
  message: string;
}
