import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";
import { ThreatDetailsModal } from "@/components/ThreatDetailsModal";
import { Globe, MapPin, Activity, Eye, X } from "lucide-react";

interface GeographicThreat {
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
  lat: number;
  lng: number;
  country: string;
  city: string;
  detectedAt: string;
  resolvedAt?: string;
  metadata?: any;
}

export function ThreatMap() {
  const [selectedThreat, setSelectedThreat] = useState<GeographicThreat | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 0 });
  const [zoom, setZoom] = useState(2);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data: geographicThreats, isLoading } = useQuery({
    queryKey: ["/api/analytics/geographic"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/analytics/geographic");
      return await response.json() as GeographicThreat[];
    },
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#f97316';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getSeverityRadius = (severity: string) => {
    switch (severity) {
      case 'critical': return 12;
      case 'high': return 10;
      case 'medium': return 8;
      case 'low': return 6;
      default: return 6;
    }
  };

  const focusOnThreat = (threat: GeographicThreat) => {
    setSelectedThreat(threat);
    setMapCenter({ lat: threat.lat, lng: threat.lng });
    setZoom(6);
  };

  const viewThreatDetails = (threat: GeographicThreat) => {
    setSelectedThreat(threat);
    setShowDetailsModal(true);
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

  const resetView = () => {
    setSelectedThreat(null);
    setMapCenter({ lat: 20, lng: 0 });
    setZoom(2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Threat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted/30 rounded-lg border border-border flex items-center justify-center animate-pulse">
            <p className="text-muted-foreground">Loading threat map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Global Threat Map
            </span>
            <div className="flex gap-2">
              {selectedThreat && (
                <Button variant="outline" size="sm" onClick={resetView}>
                  Reset View
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Live
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-80 bg-slate-900 rounded-lg border border-border overflow-hidden">
            {/* Simplified world map visualization */}
            <svg 
              viewBox="0 0 1000 500" 
              className="w-full h-full"
              style={{ backgroundColor: '#0f172a' }}
            >
              {/* World map continents (simplified) */}
              <g fill="#1e293b" stroke="#334155" strokeWidth="1">
                {/* North America */}
                <path d="M150 120 L280 100 L320 180 L250 220 L180 200 Z" />
                {/* South America */}
                <path d="M220 280 L280 260 L300 380 L240 400 L220 350 Z" />
                {/* Europe */}
                <path d="M450 120 L520 100 L540 150 L480 160 Z" />
                {/* Africa */}
                <path d="M480 180 L540 170 L560 300 L500 320 L480 250 Z" />
                {/* Asia */}
                <path d="M550 80 L750 70 L800 200 L600 220 L550 150 Z" />
                {/* Australia */}
                <path d="M700 320 L780 310 L790 360 L720 370 Z" />
              </g>

              {/* Threat markers */}
              {geographicThreats?.map((threat) => {
                // Convert lat/lng to SVG coordinates (simplified projection)
                const x = ((threat.lng + 180) * 1000) / 360;
                const y = ((90 - threat.lat) * 500) / 180;
                
                return (
                  <g key={threat.id}>
                    {/* Pulsing ring for active threats */}
                    {threat.status === 'active' && (
                      <circle
                        cx={x}
                        cy={y}
                        r={getSeverityRadius(threat.severity) + 5}
                        fill="none"
                        stroke={getSeverityColor(threat.severity)}
                        strokeWidth="2"
                        opacity="0.6"
                        className="animate-ping"
                      />
                    )}
                    
                    {/* Main threat marker */}
                    <circle
                      cx={x}
                      cy={y}
                      r={getSeverityRadius(threat.severity)}
                      fill={getSeverityColor(threat.severity)}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => focusOnThreat(threat)}
                    />
                    
                    {/* Tooltip on hover */}
                    <title>
                      {threat.title} - {threat.city}, {threat.country}
                      {'\n'}Severity: {threat.severity}
                      {'\n'}Risk Score: {threat.riskScore}
                      {'\n'}Click for details
                    </title>
                  </g>
                );
              })}
              
              {/* Connection lines for related threats */}
              {geographicThreats?.length > 1 && (
                <g stroke="#374151" strokeWidth="1" opacity="0.3">
                  {geographicThreats.slice(0, -1).map((threat, index) => {
                    const nextThreat = geographicThreats[index + 1];
                    const x1 = ((threat.lng + 180) * 1000) / 360;
                    const y1 = ((90 - threat.lat) * 500) / 180;
                    const x2 = ((nextThreat.lng + 180) * 1000) / 360;
                    const y2 = ((90 - nextThreat.lat) * 500) / 180;
                    
                    return (
                      <line
                        key={`${threat.id}-${nextThreat.id}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        strokeDasharray="5,5"
                      />
                    );
                  })}
                </g>
              )}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-background/90 p-3 rounded-lg border border-border">
              <h4 className="font-medium text-sm mb-2">Threat Severity</h4>
              <div className="space-y-1">
                {['critical', 'high', 'medium', 'low'].map((severity) => (
                  <div key={severity} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full border border-white"
                      style={{ backgroundColor: getSeverityColor(severity) }}
                    />
                    <span className="capitalize">{severity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats overlay */}
            <div className="absolute top-4 right-4 bg-background/90 p-3 rounded-lg border border-border">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{geographicThreats?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Active Locations</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threat list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Threats by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {geographicThreats?.map((threat) => (
              <div 
                key={threat.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedThreat?.id === threat.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-muted/50 border-border hover:bg-muted'
                }`}
                onClick={() => focusOnThreat(threat)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full border border-white"
                    style={{ backgroundColor: getSeverityColor(threat.severity) }}
                  />
                  <div>
                    <p className="font-medium text-foreground">{threat.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {threat.city}, {threat.country} • {threat.sourceIp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityBadgeColor(threat.severity)}>
                    {threat.severity.toUpperCase()}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewThreatDetails(threat);
                    }}
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected threat details */}
      {selectedThreat && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Threat Details</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedThreat(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <p className="text-foreground">{selectedThreat.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="text-foreground">{selectedThreat.city}, {selectedThreat.country}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Source IP</label>
                <p className="text-foreground font-mono">{selectedThreat.sourceIp}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Risk Score</label>
                <p className="text-foreground">{selectedThreat.riskScore}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <p className="text-foreground capitalize">{selectedThreat.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedThreat.status === 'active' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                  selectedThreat.status === 'investigating' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                }`}>
                  {selectedThreat.status.toUpperCase()}
                </span>
              </div>
            </div>
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