"use client";

import { useDataCacheStore } from "@/stores/cache";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, Trash2 } from "lucide-react";
import { useMemo } from "react";

export function CacheStatus() {
  const { quickWinsCache, isQuickWinsCacheExpired, clearQuickWinsCache } =
    useDataCacheStore();

  const cacheInfo = useMemo(() => {
    if (!quickWinsCache) {
      return {
        status: "empty",
        text: "No cache",
        variant: "secondary" as const,
      };
    }

    const isExpired = isQuickWinsCacheExpired();
    const ageInMs = Date.now() - quickWinsCache.timestamp;
    const ageInHours = Math.floor(ageInMs / (1000 * 60 * 60));
    const ageInMinutes = Math.floor((ageInMs % (1000 * 60 * 60)) / (1000 * 60));

    let ageText = "";
    if (ageInHours > 0) {
      ageText = `${ageInHours}h ${ageInMinutes}m ago`;
    } else {
      ageText = `${ageInMinutes}m ago`;
    }

    if (isExpired) {
      return {
        status: "expired",
        text: `Expired (${ageText})`,
        variant: "destructive" as const,
      };
    } else {
      return {
        status: "fresh",
        text: `Fresh (${ageText})`,
        variant: "default" as const,
      };
    }
  }, [quickWinsCache, isQuickWinsCacheExpired]);

  const handleClearCache = () => {
    clearQuickWinsCache();
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      {cacheInfo.status === "expired" ? (
        <RefreshCw className="w-4 h-4 text-orange-500" />
      ) : (
        <Clock className="w-4 h-4 text-green-500" />
      )}
      <Badge variant={cacheInfo.variant} className="text-xs">
        {cacheInfo.text}
      </Badge>
      {quickWinsCache && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearCache}
          className="h-6 px-2 text-xs"
          title="Clear cache and fetch fresh data"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
