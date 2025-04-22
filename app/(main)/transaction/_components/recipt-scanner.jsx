"use client";

import { useRef, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";

export function ReceiptScanner({ onScanComplete }) {
  const inputRef = useRef(null);

  const {
    loading: isScanning,
    fn: handleScan,
    data: result,
  } = useFetch(scanReceipt);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size exceeds 5MB limit");
      return;
    }

    handleScan(file);
  };

  useEffect(() => {
    if (result && !isScanning) {
      onScanComplete?.(result);
      toast.success("Receipt scanned successfully");
    }
  }, [result, isScanning, onScanComplete]);

  return (
    <div className="w-full">
      <input
        type="file"
        ref={inputRef}
        hidden
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
      />

      <Button
        type="button"
        variant="secondary"
        className="w-full flex items-center justify-center gap-2 text-white bg-indigo-500 hover:bg-indigo-600 transition-all duration-200"
        disabled={isScanning}
        onClick={() => inputRef.current?.click()}
      >
        {isScanning ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" />
            <span>Scanning...</span>
          </>
        ) : (
          <>
            <Camera className="w-4 h-4" />
            <span>Scan Receipt</span>
          </>
        )}
      </Button>
    </div>
  );
}
