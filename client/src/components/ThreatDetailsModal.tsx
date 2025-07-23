import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";
import { 
  Shield, 
  Clock, 
  MapPin, 
  Network, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Threat {
  id: number;
  title: string;
  description: string;
  severity: string;
  type: string;
  sourceIp: string;
  targetIp?: string;
  port?: number;
  riskScore: number;
  status: string;
  detectedAt: string;
  resolvedAt?: string;
  metadata?: any;
}

interface ThreatDetailsModalProps {
  threat: Threat | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ThreatDetailsModal({ threat, isOpen, onClose }: ThreatDetailsModalProps) {
  const [actionNotes, setActionNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateThreatMutation = useMutation({
    mutationFn: async ({ action, notes }: { action: string; notes: string }) => {
      if (!threat) throw new Error("No threat selected");
      
      const updates: any = { 
        status: action === "block" ? "blocked" : "resolved" 
      };
      
      if (action === "resolve") {
        updates.resolvedAt = new Date().toISOString();
      }

      const response = await authenticatedApiRequest(
        "PATCH", 
        `/api/threats/${threat.id}`,
        { ...updates, actionNotes: notes }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update threat");
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/threats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/geographic"] });
      
      toast({
        title: "Threat Updated",
        description: `Threat has been ${variables.action === "block" ? "blocked" : "resolved"} successfully.`,
      });
      
      setActionNotes("");
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update threat. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "medium": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "investigating": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "blocked": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "resolved": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 90) return "text-red-600 dark:text-red-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 50) return "text-orange-600 dark:text-orange-400";
    return "text-green-600 dark:text-green-400";
  };

  const canTakeAction = threat && (threat.status === "active" || threat.status === "investigating");

  if (!threat) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6" />
            Threat Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">{threat.title}</h3>
            <p className="text-muted-foreground mb-3">{threat.description}</p>
            
            <div className="flex flex-wrap gap-2">
              <Badge className={getSeverityColor(threat.severity)}>
                {threat.severity.toUpperCase()}
              </Badge>
              <Badge className={getStatusColor(threat.status)}>
                {threat.status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {threat.type}
              </Badge>
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Network className="h-5 w-5" />
                Network Information
              </h4>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Source IP</Label>
                  <p className="font-mono text-foreground">{threat.sourceIp}</p>
                </div>
                
                {threat.targetIp && (
                  <div>
                    <Label className="text-muted-foreground">Target IP</Label>
                    <p className="font-mono text-foreground">{threat.targetIp}</p>
                  </div>
                )}
                
                {threat.port && (
                  <div>
                    <Label className="text-muted-foreground">Port</Label>
                    <p className="text-foreground">{threat.port}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-muted-foreground">Risk Score</Label>
                  <p className={`text-2xl font-bold ${getRiskScoreColor(threat.riskScore)}`}>
                    {threat.riskScore}/100
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </h4>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Detected</Label>
                  <p className="text-foreground">
                    {formatDistanceToNow(new Date(threat.detectedAt), { addSuffix: true })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(threat.detectedAt).toLocaleString()}
                  </p>
                </div>
                
                {threat.resolvedAt && (
                  <div>
                    <Label className="text-muted-foreground">Resolved</Label>
                    <p className="text-foreground">
                      {formatDistanceToNow(new Date(threat.resolvedAt), { addSuffix: true })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(threat.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Geographic Information */}
          {threat.metadata && (threat.metadata.country || threat.metadata.city) && (
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Geographic Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {threat.metadata.city && (
                  <div>
                    <Label className="text-muted-foreground">City</Label>
                    <p className="text-foreground">{threat.metadata.city}</p>
                  </div>
                )}
                
                {threat.metadata.country && (
                  <div>
                    <Label className="text-muted-foreground">Country</Label>
                    <p className="text-foreground">{threat.metadata.country}</p>
                  </div>
                )}
                
                {threat.metadata.lat && threat.metadata.lng && (
                  <div>
                    <Label className="text-muted-foreground">Coordinates</Label>
                    <p className="text-foreground font-mono">
                      {threat.metadata.lat.toFixed(4)}, {threat.metadata.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Metadata */}
          {threat.metadata && Object.keys(threat.metadata).length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Additional Details
              </h4>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm text-foreground whitespace-pre-wrap">
                  {JSON.stringify(threat.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Action Section */}
          {canTakeAction && (
            <div className="space-y-4 border-t border-border pt-4">
              <h4 className="font-semibold text-foreground">Take Action</h4>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="actionNotes">Action Notes (Optional)</Label>
                  <Textarea
                    id="actionNotes"
                    placeholder="Add notes about this action..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            {canTakeAction && (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => updateThreatMutation.mutate({ action: "block", notes: actionNotes })}
                  disabled={updateThreatMutation.isPending}
                >
                  {updateThreatMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Block Threat
                </Button>
                
                <Button
                  onClick={() => updateThreatMutation.mutate({ action: "resolve", notes: actionNotes })}
                  disabled={updateThreatMutation.isPending}
                >
                  {updateThreatMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Resolve Threat
                </Button>
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}