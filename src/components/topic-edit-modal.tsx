import { useState } from "react";
import { X, Link2 } from "lucide-react";
import { cn } from "@/utils/tailwind";
import type { Topic, InternalTag, ExternalTag, ADOWorkItem } from "@/types/topic";
import TagSelector from "./tag-selector";
import AdoSearch from "./ado-search";
import { AdoLinkBadge } from "./ado-link";
import { useAdoConfig } from "@/hooks/use-ado";

interface TopicEditModalProps {
  topic: Topic;
  onSave: (topic: Topic) => void;
  onCancel: () => void;
}

export default function TopicEditModal({
  topic,
  onSave,
  onCancel,
}: TopicEditModalProps) {
  const [description, setDescription] = useState(topic.description);
  const [tags, setTags] = useState<(InternalTag | ExternalTag)[]>(topic.tags);
  const [adoWorkItem, setAdoWorkItem] = useState<ADOWorkItem | undefined>(topic.adoWorkItem);
  const [showAdoSearch, setShowAdoSearch] = useState(false);

  const { config: adoConfig, isConfigured } = useAdoConfig();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || tags.length === 0) return;

    onSave({
      ...topic,
      description: description.trim(),
      tags,
      adoWorkItem,
    });
  };

  const handleAdoSelect = (workItem: ADOWorkItem) => {
    setAdoWorkItem(workItem);
    setShowAdoSearch(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative glass-card p-6 w-full max-w-md mx-4 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Edit Topic</h2>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description input */}
          <div>
            <label className="block text-sm text-white/70 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the topic..."
              className={cn(
                "w-full bg-white/10 border border-white/20 rounded-lg",
                "px-4 py-3 text-white placeholder-white/40",
                "focus:outline-none focus:ring-2 focus:ring-white/30",
                "resize-none text-sm"
              )}
              rows={3}
              autoFocus
            />
          </div>

          {/* Tag selector */}
          <div>
            <label className="block text-sm text-white/70 mb-1.5">
              {topic.type === "internal" ? "Teams" : "Categories"} (select multiple)
            </label>
            <TagSelector type={topic.type} value={tags} onChange={setTags} />
          </div>

          {/* ADO Work Item Link */}
          <div>
            <label className="block text-sm text-white/70 mb-1.5">
              Work Item (optional)
            </label>
            {showAdoSearch ? (
              <AdoSearch
                config={adoConfig}
                onSelect={handleAdoSelect}
                onCancel={() => setShowAdoSearch(false)}
              />
            ) : adoWorkItem ? (
              <div className="flex items-center gap-2">
                <AdoLinkBadge workItem={adoWorkItem} />
                <button
                  type="button"
                  onClick={() => setAdoWorkItem(undefined)}
                  className="text-xs text-white/50 hover:text-white/80 transition-colors"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdoSearch(true)}
                  className="text-xs text-blue-400/70 hover:text-blue-400 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAdoSearch(true)}
                disabled={!isConfigured}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                  "bg-white/10 text-white/70",
                  "hover:bg-white/15 hover:text-white transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Link2 className="w-4 h-4" />
                {isConfigured ? "Link ADO Work Item" : "Configure ADO in Settings"}
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                "px-4 py-2 rounded-lg text-sm",
                "text-white/60 hover:text-white hover:bg-white/10",
                "transition-colors"
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!description.trim() || tags.length === 0}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                "bg-white/20 text-white",
                "hover:bg-white/30 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
