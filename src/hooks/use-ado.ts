import { useState, useEffect, useCallback } from "react";
import type { ADOConfig, ADOWorkItem } from "@/types/topic";
import { getAdoConfig, setAdoConfig, clearAdoConfig } from "@/actions/storage";
import {
  testAdoConnection,
  searchAdoWorkItems,
  getAdoWorkItem,
  toAdoWorkItem,
  type ADOSearchResult,
} from "@/actions/ado";

export function useAdoConfig() {
  const [config, setConfig] = useState<ADOConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedConfig = await getAdoConfig();
      setConfig(loadedConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ADO config");
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = useCallback(async (newConfig: ADOConfig) => {
    try {
      setError(null);
      const saved = await setAdoConfig(newConfig);
      setConfig(saved);
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save ADO config");
      throw err;
    }
  }, []);

  const removeConfig = useCallback(async () => {
    try {
      setError(null);
      await clearAdoConfig();
      setConfig(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear ADO config");
      throw err;
    }
  }, []);

  const testConnection = useCallback(async (testConfig: ADOConfig) => {
    try {
      setError(null);
      const result = await testAdoConnection(testConfig);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Connection test failed";
      setError(message);
      return { success: false, message };
    }
  }, []);

  return {
    config,
    isLoading,
    error,
    isConfigured: config !== null,
    saveConfig,
    removeConfig,
    testConnection,
    refresh: loadConfig,
  };
}

export function useAdoSearch(config: ADOConfig | null) {
  const [results, setResults] = useState<ADOSearchResult["workItems"]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const search = useCallback(
    async (query: string) => {
      if (!config || !query.trim()) {
        setResults([]);
        return;
      }

      try {
        setIsSearching(true);
        setSearchError(null);
        const result = await searchAdoWorkItems(query, config);
        setResults(result.workItems);
        if (result.error) {
          setSearchError(result.error);
        }
      } catch (err) {
        setSearchError(
          err instanceof Error ? err.message : "Search failed"
        );
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [config]
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setSearchError(null);
  }, []);

  return {
    results,
    isSearching,
    searchError,
    search,
    clearResults,
  };
}

export function useAdoWorkItem(config: ADOConfig | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkItem = useCallback(
    async (id: number): Promise<ADOWorkItem | undefined> => {
      if (!config) {
        setError("ADO not configured");
        return undefined;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await getAdoWorkItem(id, config);
        return toAdoWorkItem(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch work item"
        );
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [config]
  );

  return {
    isLoading,
    error,
    fetchWorkItem,
  };
}
