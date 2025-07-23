import { useQuery } from "@tanstack/react-query";
import { authenticatedApiRequest } from "@/lib/auth";
import { LogTable } from "@/components/LogTable";
import { useToast } from "@/hooks/use-toast";

export default function AuditLogs() {
  const { toast } = useToast();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["/api/audit-logs"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/audit-logs");
      return await response.json();
    },
  });

  const handleExport = () => {
    if (!logs || logs.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no audit logs to export.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ["Timestamp", "Event Type", "User ID", "Source IP", "Description", "Status"];
    const csvContent = [
      headers.join(","),
      ...logs.map((log: any) => [
        new Date(log.timestamp).toISOString(),
        log.eventType,
        log.userId || "anonymous",
        log.sourceIp,
        `"${log.description.replace(/"/g, '""')}"`, // Escape quotes in description
        log.status,
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: "Audit logs have been exported to CSV file.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="animate-pulse bg-muted rounded-lg h-96"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Audit Logs</h2>
        <p className="text-muted-foreground">System events and security audit trail</p>
      </div>

      <LogTable logs={logs || []} onExport={handleExport} />
    </div>
  );
}
