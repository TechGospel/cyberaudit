import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface AuditLog {
  id: number;
  userId?: number | null;
  eventType: string;
  description: string;
  sourceIp: string;
  userAgent?: string | null;
  status: string;
  timestamp: string;
  metadata?: any;
}

interface LogTableProps {
  logs: AuditLog[];
  onExport?: () => void;
}

const getEventTypeColor = (eventType: string) => {
  switch (eventType) {
    case "authentication":
      return "bg-blue-500/20 text-blue-400";
    case "security":
      return "bg-red-500/20 text-red-400";
    case "configuration":
      return "bg-yellow-500/20 text-yellow-400";
    case "system":
      return "bg-purple-500/20 text-purple-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "bg-green-500/20 text-green-400";
    case "failed":
      return "bg-red-500/20 text-red-400";
    case "warning":
      return "bg-yellow-500/20 text-yellow-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};

export function LogTable({ logs, onExport }: LogTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sourceIp.includes(searchTerm) ||
      (log.userAgent && log.userAgent.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEventType = eventTypeFilter === "all" || log.eventType === eventTypeFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;

    return matchesSearch && matchesEventType && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Audit Logs</CardTitle>
          <div className="flex space-x-3">
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Search events, IPs, users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="authentication">Authentication</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="configuration">Configuration</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Source IP</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/50">
                  <TableCell className="text-sm">
                    {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <Badge className={getEventTypeColor(log.eventType)}>
                      {log.eventType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.userId ? `User ID: ${log.userId}` : "anonymous"}
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {log.sourceIp}
                  </TableCell>
                  <TableCell className="text-sm max-w-md truncate">
                    {log.description}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {logs.length} entries
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
