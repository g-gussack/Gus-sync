import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Settings,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Info,
  Copy,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/utils/tailwind";
import { useAdoConfig } from "@/hooks/use-ado";
import type { ADOConfig } from "@/types/topic";
import { openExternalLink } from "@/actions/shell";

function SettingsPage() {
  const {
    config,
    isLoading,
    isConfigured,
    saveConfig,
    removeConfig,
    testConnection,
  } = useAdoConfig();

  const [formData, setFormData] = useState<ADOConfig>({
    organization: config?.organization || "",
    project: config?.project || "",
    token: config?.token || "",
  });
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Update form when config loads
  useState(() => {
    if (config) {
      setFormData(config);
    }
  });

  const handleInputChange = (field: keyof ADOConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTestResult(null);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testConnection(formData);
      setTestResult(result);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveConfig(formData);
      setTestResult({ success: true, message: "Configuration saved!" });
    } catch {
      setTestResult({ success: false, message: "Failed to save configuration" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    if (
      !window.confirm(
        "Are you sure you want to remove the ADO configuration? This will unlink all work items."
      )
    ) {
      return;
    }
    await removeConfig();
    setFormData({ organization: "", project: "", token: "" });
    setTestResult(null);
  };

  const openAdoHelp = () => {
    openExternalLink(
      "https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate"
    );
  };

  const copyErrorToClipboard = () => {
    if (testResult && !testResult.success) {
      navigator.clipboard.writeText(testResult.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Parse error message for structured display
  const parseErrorMessage = (message: string) => {
    const parts = message.split("\n\nHints:\n");
    const mainError = parts[0];
    const hints = parts[1]?.split("\n- ").filter(Boolean) || [];
    
    // Extract HTTP status code if present
    const statusMatch = mainError.match(/\((\d{3})\)/);
    const statusCode = statusMatch ? statusMatch[1] : null;
    
    return { mainError, hints, statusCode };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60 text-sm">Loading...</div>
      </div>
    );
  }

  const isFormValid =
    formData.organization.trim() &&
    formData.project.trim() &&
    formData.token.trim();

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6 text-white/70" />
        <h1 className="text-xl font-semibold text-white text-glass">Settings</h1>
      </div>

      {/* ADO Configuration */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">
              Azure DevOps Integration
            </h2>
            <p className="text-sm text-white/60 mt-1">
              Connect to ADO to link work items to your topics.
            </p>
          </div>
          {isConfigured && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <Check className="w-3 h-3" />
              Connected
            </span>
          )}
        </div>

        <div className="space-y-4">
          {/* Organization */}
          <div>
            <label className="block text-sm text-white/70 mb-1.5">
              Organization
            </label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => handleInputChange("organization", e.target.value)}
              placeholder="contoso"
              className={cn(
                "w-full bg-white/10 border border-white/20 rounded-lg",
                "px-4 py-2.5 text-white placeholder-white/40 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-white/30"
              )}
            />
            <div className="text-xs text-white/40 mt-1.5 space-y-1">
              <p>Find this in your ADO URL:</p>
              <p className="font-mono text-white/50">
                dev.azure.com/<span className="text-blue-300">organization</span>/project
              </p>
              <p className="font-mono text-white/50">
                <span className="text-blue-300">organization</span>.visualstudio.com/project
              </p>
            </div>
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm text-white/70 mb-1.5">Project</label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => handleInputChange("project", e.target.value)}
              placeholder="MyProject"
              className={cn(
                "w-full bg-white/10 border border-white/20 rounded-lg",
                "px-4 py-2.5 text-white placeholder-white/40 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-white/30"
              )}
            />
            <p className="text-xs text-white/40 mt-1.5">
              The project name (case-sensitive). Find it after the organization in your URL.
            </p>
          </div>

          {/* Token */}
          <div>
            <label className="block text-sm text-white/70 mb-1.5">
              Personal Access Token (PAT)
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={formData.token}
                onChange={(e) => handleInputChange("token", e.target.value)}
                placeholder="••••••••••••••••"
                className={cn(
                  "w-full bg-white/10 border border-white/20 rounded-lg",
                  "px-4 py-2.5 pr-10 text-white placeholder-white/40 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-white/30"
                )}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showToken ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <button
              onClick={openAdoHelp}
              className="text-xs text-blue-300 hover:text-blue-200 mt-1 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              How to create a PAT
            </button>
          </div>
        </div>

        {/* Test result */}
        {testResult && testResult.success && (
          <div className="p-3 rounded-lg text-sm flex items-center gap-2 bg-green-500/20 text-green-300">
            <Check className="w-4 h-4 flex-shrink-0" />
            {testResult.message}
          </div>
        )}

        {/* Detailed error display */}
        {testResult && !testResult.success && (
          <div className="rounded-lg overflow-hidden border border-red-500/30">
            {/* Error header */}
            <div className="bg-red-500/20 px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-red-300">Connection Failed</span>
                  {parseErrorMessage(testResult.message).statusCode && (
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-red-500/30 text-red-200">
                      HTTP {parseErrorMessage(testResult.message).statusCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Error details */}
            <div className="bg-red-500/10 px-4 py-3 space-y-3">
              {/* Main error message */}
              <div className="text-sm text-red-200/90 font-mono break-all">
                {parseErrorMessage(testResult.message).mainError}
              </div>
              
              {/* Hints section */}
              {parseErrorMessage(testResult.message).hints.length > 0 && (
                <div className="pt-2 border-t border-red-500/20">
                  <div className="flex items-center gap-1.5 text-xs text-yellow-300 mb-2">
                    <Info className="w-3.5 h-3.5" />
                    <span className="font-medium">Troubleshooting Tips</span>
                  </div>
                  <ul className="space-y-1.5">
                    {parseErrorMessage(testResult.message).hints.map((hint, i) => (
                      <li key={i} className="text-xs text-white/70 flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Copy button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={copyErrorToClipboard}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded text-xs",
                    "text-white/50 hover:text-white/80 hover:bg-white/10",
                    "transition-colors"
                  )}
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy error</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAT Requirements Info */}
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-300">Required PAT Scopes</p>
              <ul className="text-xs text-white/60 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">•</span>
                  <span><strong>Work Items</strong> - Read (required)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">•</span>
                  <span><strong>Project and Team</strong> - Read (for connection test)</span>
                </li>
              </ul>
              <p className="text-xs text-white/40 pt-1">
                Check the terminal/console for detailed API logs when testing.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleTest}
            disabled={!isFormValid || isTesting}
            className={cn(
              "px-4 py-2 rounded-lg text-sm",
              "bg-white/10 text-white",
              "hover:bg-white/20 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              "bg-white/20 text-white",
              "hover:bg-white/30 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Configuration
              </>
            )}
          </button>

          {isConfigured && (
            <button
              onClick={handleRemove}
              className={cn(
                "px-4 py-2 rounded-lg text-sm",
                "text-red-400 hover:bg-red-400/20 transition-colors",
                "flex items-center gap-2 ml-auto"
              )}
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>
      </div>

      {/* App Info */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-medium text-white">About SyncTrack</h2>
        <p className="text-sm text-white/60">
          A simple app for Scrum Masters and Product Owners to track topics that
          require follow-up meetings or discussions.
        </p>
        <div className="text-xs text-white/40">
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});
