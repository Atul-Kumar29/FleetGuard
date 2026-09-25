declare module '../config/supabase' {
  const supabase: any;

  export function getSupabaseClient(accessToken?: string): any;
  export default supabase;
}

declare module './complianceStatus' {
  export function calculateComplianceStatus(
    document: {
      expiration_date?: string | Date | null;
      lead_time_days?: number;
    },
    today?: Date
  ): 'VALID' | 'WARNING' | 'EXPIRED';
}

declare module './complianceStatus.js' {
  export function calculateComplianceStatus(
    document: {
      expiration_date?: string | Date | null;
      lead_time_days?: number;
    },
    today?: Date
  ): 'VALID' | 'WARNING' | 'EXPIRED';
}

declare module '../utils/riskCalculator' {
  export function calculateMaintenanceRisk(
    currentMileage: number,
    lastServiceMileage?: number | null
  ): {
    distanceSinceLastService: number;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

declare module '../utils/riskCalculator.js' {
  export function calculateMaintenanceRisk(
    currentMileage: number,
    lastServiceMileage?: number | null
  ): {
    distanceSinceLastService: number;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        email?: string;
        role?: string;
      };
      supabase?: unknown;
    }
  }
}

export {};
