// This file contains mock data generators for development and testing
// In production, this would be replaced with real API calls

export const generateMockThreatData = () => {
  const severities = ["critical", "high", "medium", "low"];
  const types = ["malware", "intrusion", "ddos", "phishing"];
  const statuses = ["active", "investigating", "resolved"];
  
  return {
    severity: severities[Math.floor(Math.random() * severities.length)],
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    riskScore: Math.floor(Math.random() * 100),
    detectedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
  };
};

export const generateMockIP = () => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

export const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
};

export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "threat-critical";
    case "high":
      return "threat-high";
    case "medium":
      return "threat-medium";
    case "low":
      return "threat-low";
    default:
      return "threat-medium";
  }
};

export const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return "skull";
    case "high":
      return "alert-triangle";
    case "medium":
      return "alert-circle";
    case "low":
      return "info";
    default:
      return "alert-circle";
  }
};
