import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";

export interface Threat {
  id: number;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  type: "malware" | "intrusion" | "ddos" | "phishing";
  sourceIp: string;
  targetIp?: string | null;
  port?: number | null;
  riskScore: number;
  status: "active" | "investigating" | "resolved" | "blocked";
  detectedAt: string;
  resolvedAt?: string | null;
  metadata?: any;
}

export interface ThreatFilters {
  severity?: string;
  type?: string;
  status?: string;
}

export function useThreats(filters?: ThreatFilters) {
  return useQuery({
    queryKey: ["/api/threats", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.severity) params.append("severity", filters.severity);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.status) params.append("status", filters.status);
      
      const response = await authenticatedApiRequest(
        "GET", 
        `/api/threats${params.toString() ? `?${params.toString()}` : ""}`
      );
      return (await response.json()) as Threat[];
    },
  });
}

export function useThreat(id: number) {
  return useQuery({
    queryKey: ["/api/threats", id],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", `/api/threats/${id}`);
      return (await response.json()) as Threat;
    },
    enabled: !!id,
  });
}

export function useCreateThreat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (threat: Omit<Threat, "id" | "detectedAt" | "resolvedAt">) => {
      const response = await authenticatedApiRequest("POST", "/api/threats", threat);
      return (await response.json()) as Threat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threats"] });
    },
  });
}

export function useUpdateThreat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Threat> }) => {
      const response = await authenticatedApiRequest("PATCH", `/api/threats/${id}`, updates);
      return (await response.json()) as Threat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threats"] });
    },
  });
}
