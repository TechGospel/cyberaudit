import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";
import { BarChart3, TrendingUp, Activity, Shield } from "lucide-react";
import { ThreatTimeline } from "@/components/ThreatTimeline";
import { ThreatMap } from "@/components/ThreatMap";

export default function Analytics() {
  const { data: threats } = useQuery({
    queryKey: ["/api/threats"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/threats");
      return await response.json();
    },
  });

  const { data: logs } = useQuery({
    queryKey: ["/api/audit-logs"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/audit-logs");
      return await response.json();
    },
  });

  // Calculate analytics
  const threatsBySeverity = threats?.reduce((acc: any, threat: any) => {
    acc[threat.severity] = (acc[threat.severity] || 0) + 1;
    return acc;
  }, {}) || {};

  const threatsByType = threats?.reduce((acc: any, threat: any) => {
    acc[threat.type] = (acc[threat.type] || 0) + 1;
    return acc;
  }, {}) || {};

  const logsByType = logs?.reduce((acc: any, log: any) => {
    acc[log.eventType] = (acc[log.eventType] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Security Analytics</h2>
        <p className="text-muted-foreground">Comprehensive analysis of security events and threats</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Threats</p>
                <p className="text-2xl font-bold text-foreground">{threats?.length || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Incidents</p>
                <p className="text-2xl font-bold text-foreground">
                  {threats?.filter((t: any) => t.status === "active").length || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Resolved Today</p>
                <p className="text-2xl font-bold text-foreground">
                  {threats?.filter((t: any) => t.status === "resolved").length || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Avg Risk Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {threats?.length 
                    ? Math.round(threats.reduce((sum: number, t: any) => sum + t.riskScore, 0) / threats.length)
                    : 0
                  }
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threats by Severity */}
        <Card>
          <CardHeader>
            <CardTitle>Threats by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(threatsBySeverity).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      severity === "critical" ? "bg-red-500" :
                      severity === "high" ? "bg-yellow-500" :
                      severity === "medium" ? "bg-orange-500" : "bg-green-500"
                    }`}></div>
                    <span className="text-sm font-medium capitalize">{severity}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Threats by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Threats by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(threatsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium capitalize">{type}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Events by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(logsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      type === "authentication" ? "bg-blue-500" :
                      type === "security" ? "bg-red-500" :
                      type === "configuration" ? "bg-yellow-500" : "bg-purple-500"
                    }`}></div>
                    <span className="text-sm font-medium capitalize">{type}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Interactive Components */}
      <div className="space-y-6">
        {/* Threat Activity Timeline */}
        <ThreatTimeline />
        
        {/* Global Threat Map */}
        <ThreatMap />
      </div>
    </div>
  );
}
