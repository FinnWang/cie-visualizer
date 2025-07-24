export interface CIEPoint {
  id: string;
  name: string;
  uPrime: number;
  vPrime: number;
}

// For internal use, after calculating display coordinates
export interface DisplayCIEPoint extends CIEPoint {
  xDisplay: number;
  yDisplay: number;
}

// Type for exported/imported points (without internal id)
export interface ExternalCIEPoint {
  name: string;
  uPrime: number;
  vPrime: number;
}
