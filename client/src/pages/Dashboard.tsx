import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";
import { 
  AlertTriangle, 
  Shield, 
  Server, 
  MapPin,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import { formatTimeAgo, getSeverityColor } from "@/lib/mockData";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/dashboard/stats");
      return await response.json();
    },
  });

  const { data: threats } = useQuery({
    queryKey: ["/api/threats"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/threats?limit=5");
      return await response.json();
    },
  });

  const { data: recentLogs } = useQuery({
    queryKey: ["/api/audit-logs"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/audit-logs?limit=5");
      return await response.json();
    },
  });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Threats</p>
                <p className="text-3xl font-bold text-foreground">{stats?.activeThreats || 0}</p>
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from yesterday
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Critical Alerts</p>
                <p className="text-3xl font-bold text-foreground">{stats?.criticalAlerts || 0}</p>
                <p className="text-yellow-400 text-sm mt-1 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -8% from yesterday
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Systems Online</p>
                <p className="text-3xl font-bold text-foreground">{stats?.systemsOnline || 98.7}%</p>
                <p className="text-green-400 text-sm mt-1 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  All systems operational
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Server className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Last Login IP</p>
                <p className="text-xl font-bold text-foreground font-mono">{stats?.lastLoginIP || "192.168.1.100"}</p>
                <p className="text-muted-foreground text-sm mt-1">{stats?.lastLoginTime || "2 minutes ago"}</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Timeline Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Threat Activity Timeline</CardTitle>
              <div className="flex space-x-2">
                <Button size="sm" variant="default">24h</Button>
                <Button size="sm" variant="outline">7d</Button>
                <Button size="sm" variant="outline">30d</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/30 rounded-lg border border-border flex items-center justify-center relative overflow-hidden">
              {/* Mock Chart Area */}
              <div className="absolute inset-0 p-4">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="threatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 160 Q 50 140 100 120 T 200 100 T 300 80 T 400 60"
                    stroke="rgb(239, 68, 68)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M 0 160 Q 50 140 100 120 T 200 100 T 300 80 T 400 60 L 400 200 L 0 200 Z"
                    fill="url(#threatGradient)"
                  />
                </svg>
              </div>
              <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded mr-2"></span>
                  Critical Threats: {stats?.criticalAlerts || 0} incidents
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* World Map */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Global Threat Map</CardTitle>
              <span className="text-sm text-muted-foreground">Live tracking</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/30 rounded-lg border border-border relative overflow-hidden">
              {/* Mock world map */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
              
              {/* Threat markers */}
              <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
              <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              
              <div className="absolute bottom-4 left-4 text-xs text-muted-foreground space-y-1">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded mr-2"></span>
                  High Risk
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded mr-2"></span>
                  Medium Risk
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded mr-2"></span>
                  Low Risk
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Security Events</CardTitle>
            <Link href="/logs">
              <Button variant="link" className="text-primary hover:text-primary/80">
                View all logs <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLogs?.slice(0, 3).map((log: any) => (
              <div key={log.id} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  log.status === "success" ? "bg-green-500/20" :
                  log.status === "failed" ? "bg-red-500/20" : "bg-yellow-500/20"
                }`}>
                  {log.status === "success" ? (
                    <CheckCircle className={`h-5 w-5 ${
                      log.status === "success" ? "text-green-500" :
                      log.status === "failed" ? "text-red-500" : "text-yellow-500"
                    }`} />
                  ) : (
                    <AlertTriangle className={`h-5 w-5 ${
                      log.status === "success" ? "text-green-500" :
                      log.status === "failed" ? "text-red-500" : "text-yellow-500"
                    }`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">{log.description}</p>
                  <p className="text-muted-foreground text-sm">
                    Source: {log.sourceIp} | Type: {log.eventType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">
                    {formatTimeAgo(new Date(log.timestamp))}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    log.status === "success" ? "bg-green-500/20 text-green-400" :
                    log.status === "failed" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            )) || (
              <p className="text-muted-foreground text-center py-8">No recent events</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
