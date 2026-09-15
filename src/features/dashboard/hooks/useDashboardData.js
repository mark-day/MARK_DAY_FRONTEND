import { useEffect, useState } from "react";

const DEFAULT_STATS = {
  presentDays: 0,
  absentDays: 0,
  lateComing: 0,
  remainingLeaves: 0,
};

export const useDashboardData = (empId) => {
  const [stats, setStats] =
    useState(DEFAULT_STATS);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      if (!empId) {
        setStats(DEFAULT_STATS);
        return;
      }

      try {
        setLoading(true);
        setError("");

        /*
         * IMPORTANT:
         *
         * Your existing code does not provide a
         * dedicated dashboard statistics endpoint.
         *
         * Do NOT invent an API endpoint here.
         *
         * Connect your existing attendance endpoint
         * in this layer once its exact route and
         * response structure are confirmed.
         */

        if (!mounted) return;

        setStats(DEFAULT_STATS);
      } catch (err) {
        console.error(
          "Dashboard statistics failed:",
          err
        );

        if (!mounted) return;

        setError(
          err.response?.data?.message ||
            "Unable to load attendance overview."
        );

        setStats(DEFAULT_STATS);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, [empId]);

  return {
    stats,
    loading,
    error,
  };
};