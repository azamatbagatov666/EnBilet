"use client";

import { useEffect, useCallback, useMemo } from "react";
import { throttle } from "lodash";

import RefreshSvg from "@/src/components/svg/RefreshSvg";

type Props = {
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
  text?: string;
};

export default function RefreshButton({
  onRefresh,
  isRefreshing,
  text,
}: Props) {
  const throttledRefresh = useMemo(
    () =>
      throttle(
        async (cb: () => Promise<void> | void) => {
          try {
            await cb();
          } finally {
          }
        },
        2000,
        { leading: true, trailing: false },
      ),
    [],
  );

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await throttledRefresh(onRefresh);
    }
  }, [onRefresh, throttledRefresh]);

  useEffect(() => {
    return () => {
      throttledRefresh.cancel();
    };
  }, [throttledRefresh]);

  return (
    <>
      <button
        className={`btn h-7 sm:h-9 px-1 sm:px-4 outline-none! border-gray-300 ${isRefreshing ? "pointer-events-none" : ""}`}
        onClick={() => {
          handleRefresh();
        }}
      >
        {isRefreshing ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <RefreshSvg />
        )}
        {text ? text : "Veriyi Yenile"}
      </button>
    </>
  );
}
