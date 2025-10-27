// src/components/RefreshButton.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  onRefresh?: () => Promise<void>;
  disabled?: boolean;
}
const RefreshButton = ({ onRefresh, disabled = false }: RefreshButtonProps) => {
  const [loading, setLoading] = useState(false);

  const refreshAll = async () => {
    if (!onRefresh) return;
    setLoading(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error("Refresh failed:", error);
      // Optionally show error notification to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={refreshAll}
      disabled={loading || disabled}
      className="px-6 py-2.5 font-medium text-base"
      size="lg"
      aria-label={loading ? "Refreshing data..." : "Refresh all data"}
      aria-disabled={loading || disabled}
    >
      <RefreshCw className={`w-6 h-6 mr-2 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Refreshing..." : "Refresh All"}
    </Button>
  );
};

export default RefreshButton;
