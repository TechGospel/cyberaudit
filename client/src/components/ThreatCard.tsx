import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatTimeAgo, getSeverityColor, getSeverityIcon } from "@/lib/mockData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ThreatDetailsModal } from "@/components/ThreatDetailsModal";
import { Icon } from "lucide-react";
import * as Icons from "lucide-react";

interface ThreatCardProps {
  threat: {
    id: number;
    title: string;
    description: string;
    severity: string;
    type: string;
    sourceIp: string;
    targetIp?: string | null;
    port?: number | null;
    riskScore: number;
    status: string;
    detectedAt: string;
    resolvedAt?: string;
    metadata?: any;
  };
}

export function ThreatCard({ threat }: ThreatCardProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateThreatMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await authenticatedApiRequest("PATCH", `/api/threats/${id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threats"] });
      toast({
        title: "Threat updated",
        description: "The threat status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update threat status.",
        variant: "destructive",
      });
    },
  });

  const handleBlock = () => {
    updateThreatMutation.mutate({
      id: threat.id,
      updates: { status: "blocked" },
    });
  };

  const handleResolve = () => {
    updateThreatMutation.mutate({
      id: threat.id,
      updates: { status: "resolved", resolvedAt: new Date().toISOString() },
    });
  };

  const severityColor = getSeverityColor(threat.severity);
  const iconName = getSeverityIcon(threat.severity);
  const IconComponent = (Icons as any)[iconName] || Icons.AlertCircle;

  return (
    <Card className="hover:border-muted-foreground/30 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", severityColor)}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {threat.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                Source: {threat.sourceIp}
                {threat.targetIp && ` → Target: ${threat.targetIp}`}
                {threat.port && ` | Port: ${threat.port}`}
              </p>
              <div className="flex items-center space-x-4">
                <Badge className={severityColor}>
                  {threat.severity}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  {formatTimeAgo(new Date(threat.detectedAt))}
                </span>
                <span className="text-muted-foreground text-sm">
                  Risk Score: {threat.riskScore}/100
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {threat.status === "active" && (
              <>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleBlock}
                  disabled={updateThreatMutation.isPending}
                >
                  Block
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={handleResolve}
                  disabled={updateThreatMutation.isPending}
                >
                  Resolve
                </Button>
              </>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowDetailsModal(true)}
            >
              Details
            </Button>
          </div>
        </div>
      </CardContent>
      
      <ThreatDetailsModal
        threat={{
          ...threat,
          port: threat.port ?? undefined,
          targetIp: threat.targetIp ?? undefined,
        }}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </Card>
  );
}
