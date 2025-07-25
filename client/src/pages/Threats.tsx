import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThreatCard } from "@/components/ThreatCard";
import { useThreats } from "@/hooks/useThreats";
import { RefreshCw, Filter } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Threats() {
  const [severityFilter, setSeverityFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [sourceIpFilter, setSourceIpFilter] = useState("");
  
  const queryClient = useQueryClient();

  const { data: threats, isLoading, refetch } = useThreats({
    severity: severityFilter,
    type: typeFilter,
    status: statusFilter,
  });

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
  };

  const filteredThreats = threats?.filter(threat => {
    if (sourceIpFilter && !threat.sourceIp.includes(sourceIpFilter)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Threat Detection</h2>
          <p className="text-muted-foreground">Real-time monitoring of security threats</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Threat Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Severity Level
              </label>
              <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value === "all" ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Source IP
              </label>
              <Input
                type="text"
                placeholder="Enter IP address"
                value={sourceIpFilter}
                onChange={(e) => setSourceIpFilter(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Threat Type
              </label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value === "all" ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="malware">Malware</SelectItem>
                  <SelectItem value="intrusion">Intrusion</SelectItem>
                  <SelectItem value="ddos">DDoS</SelectItem>
                  <SelectItem value="phishing">Phishing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threats List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredThreats && filteredThreats.length > 0 ? (
          filteredThreats.map((threat) => (
            <ThreatCard
              key={threat.id}
              threat={{
                ...threat,
                resolvedAt: threat.resolvedAt === null ? undefined : threat.resolvedAt,
              }}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No threats found matching the current filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
