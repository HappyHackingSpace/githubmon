import { useDataCacheStore } from "@/stores/cache";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PageHeader() {
  const { rateLimitInfo } = useDataCacheStore();

  const isRateLimitCritical =
    rateLimitInfo &&
    (rateLimitInfo.remaining === 0 ||
      (rateLimitInfo.remaining / rateLimitInfo.limit) * 100 < 10);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b pb-4 top-0 z-10">

      <div className="flex items-center gap-3">
        {isRateLimitCritical && (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <Badge variant="destructive" className="text-xs">
              Rate Limit: {rateLimitInfo?.remaining || 0}/
              {rateLimitInfo?.limit || 0}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
