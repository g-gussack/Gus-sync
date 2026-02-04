import { useState } from "react";
import { Plus, Link2 } from "lucide-react";
import { cn } from "@/utils/tailwind";
import type {
  TopicType,
  InternalTag,
  ExternalTag,
  ADOWorkItem,
} from "@/types/topic";
import { INTERNAL_TAGS, EXTERNAL_TAGS } from "@/types/topic";
import TagSelector from "./tag-selector";
import AdoSearch from "./ado-search";
import { AdoLinkBadge } from "./ado-link";
import { useAdoConfig } from "@/hooks/use-ado";

interface TopicFormProps {
  type: TopicType;
  onSubmit: (
    description: string,
    tags: (InternalTag | ExternalTag)[],
    adoWorkItem?: ADOWorkItem
  ) => void;
  onCancel?: () => void;
}

export default function TopicForm({ type, onSubmit, onCancel }: TopicFormProps) {
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<(InternalTag | ExternalTag)[]>([
    type === "internal" ? INTERNAL_TAGS[0] : EXTERNAL_TAGS[0]
  ]);
  const [adoWorkItem, setAdoWorkItem] = useState<ADOWorkItem | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdoSearch, setShowAdoSearch] = useState(false);

  const { config: adoConfig, isConfigured } = useAdoConfig();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || tags.length === 0) return;

    onSubmit(description.trim(), tags, adoWorkItem);
    setDescription("");
    setTags([type === "internal" ? INTERNAL_TAGS[0] : EXTERNAL_TAGS[0]]);
    setAdoWorkItem(undefined);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setDescription("");
    setTags([type === "internal" ? INTERNAL_TAGS[0] : EXTERNAL_TAGS[0]]);
    setAdoWorkItem(undefined);
    setIsExpanded(false);
    setShowAdoSearch(false);
    onCancel?.();
  };

  const handleAdoSelect = (workItem: ADOWorkItem) => {
    setAdoWorkItem(workItem);
    setShowAdoSearch(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          "w-full glass-card p-4 flex items-center gap-3",
          "text-white/60 hover:text-white transition-colors",
          "hover:bg-white/10"
        )}
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm">Add Topic</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 space-y-4">
      {/* Description input */}
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the topic that needs follow-up..."
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
        <label className="block text-xs text-white/60 mb-2">
          {type === "internal" ? "Teams" : "Categories"} (select multiple)
        </label>
        <TagSelector type={type} value={tags} onChange={setTags} />
      </div>

      {/* ADO Link */}
      <div>
        <label className="block text-xs text-white/60 mb-2">
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
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleCancel}
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
          Add Topic
        </button>
      </div>
    </form>
  );
}

// Inline add form for quick entry
interface QuickAddFormProps {
  type: TopicType;
  onSubmit: (description: string, tag: InternalTag | ExternalTag) => void;
}

export function QuickAddForm({ type, onSubmit }: QuickAddFormProps) {
  const [description, setDescription] = useState("");
  const defaultTag = type === "internal" ? INTERNAL_TAGS[0] : EXTERNAL_TAGS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onSubmit(description.trim(), defaultTag);
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Quick add topic..."
        className={cn(
          "flex-1 bg-white/10 border border-white/20 rounded-lg",
          "px-4 py-2 text-white placeholder-white/40 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-white/30"
        )}
      />
      <button
        type="submit"
        disabled={!description.trim()}
        className={cn(
          "p-2 rounded-lg",
          "bg-white/20 text-white",
          "hover:bg-white/30 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Plus className="w-5 h-5" />
      </button>
    </form>
  );
}
