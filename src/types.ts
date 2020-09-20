export interface ParsedData {
  errors: any[];
  data: string[][];
}

export interface VmScope {
  result?: string;
}

export interface InputParams {
  [param: string]: number;
}
