import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";
import { ThreatDetailsModal } from "@/components/ThreatDetailsModal";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Clock, AlertTriangle, Shield, Eye } from "lucide-react";

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

interface TimelineData {
  time: string;
  hour: number;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  threats: Threat[];
}

export function ThreatTimeline() {
  const [selectedHour, setSelectedHour] = useState<TimelineData | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data: timelineData, isLoading } = useQuery({
    queryKey: ["/api/analytics/timeline"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/analytics/timeline");
      return await response.json() as TimelineData[];
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${period}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#f97316';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "medium": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const handleThreatClick = (threat: Threat) => {
    setSelectedThreat(threat);
    setShowDetailsModal(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Threat Activity Timeline (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/30 rounded-lg border border-border flex items-center justify-center animate-pulse">
            <p className="text-muted-foreground">Loading timeline data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Threat Activity Timeline (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} onClick={(data) => data && setSelectedHour(data.activePayload?.[0]?.payload)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={formatHour}
                  stroke="#9ca3af"
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  labelFormatter={(hour) => `Time: ${formatHour(hour as number)}`}
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="critical" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  name="Critical"
                />
                <Line 
                  type="monotone" 
                  dataKey="high" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  name="High"
                />
                <Line 
                  type="monotone" 
                  dataKey="medium" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                  name="Medium"
                />
                <Line 
                  type="monotone" 
                  dataKey="low" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Low"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {selectedHour && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Threats at {formatHour(selectedHour.hour)}
              </span>
              <Button variant="outline" size="sm" onClick={() => setSelectedHour(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedHour.threats.length > 0 ? (
              <div className="space-y-3">
                {selectedHour.threats.map((threat) => (
                  <div 
                    key={threat.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getSeverityColor(threat.severity) }}
                      />
                      <div>
                        <p className="font-medium text-foreground">{threat.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {threat.sourceIp} • {threat.type} • Risk: {threat.riskScore}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityBadgeColor(threat.severity)}>
                        {threat.severity.toUpperCase()}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleThreatClick(threat)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground mt-2">No threats detected at this hour</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ThreatDetailsModal
        threat={selectedThreat}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
}