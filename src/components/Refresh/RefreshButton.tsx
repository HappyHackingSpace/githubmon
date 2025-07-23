// src/components/RefreshButton.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const RefreshButton = () => {
    const [loading, setLoading] = useState(false);

    const refreshAll = async () => {
        setLoading(true);
        try {
            // Buraya senin API çağrılarını yaz
            console.log("Refreshing data...");
            await new Promise((res) => setTimeout(res, 2000)); // örnek bekleme
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={refreshAll}
            disabled={loading}
            className="px-6 py-2.5 font-medium text-base"
            size="lg"
        >
            <RefreshCw className={`w-6 h-6 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh All
        </Button>
    );
};

export default RefreshButton;
