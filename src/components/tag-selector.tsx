import { cn } from "@/utils/tailwind";
import type {
  TopicType,
  InternalTag,
  ExternalTag,
} from "@/types/topic";
import { INTERNAL_TAGS, EXTERNAL_TAGS } from "@/types/topic";

interface TagSelectorProps {
  type: TopicType;
  value: (InternalTag | ExternalTag)[];
  onChange: (tags: (InternalTag | ExternalTag)[]) => void;
  className?: string;
}

export default function TagSelector({
  type,
  value,
  onChange,
  className,
}: TagSelectorProps) {
  const tags = type === "internal" ? INTERNAL_TAGS : EXTERNAL_TAGS;

  const toggleTag = (tag: InternalTag | ExternalTag) => {
    if (value.includes(tag)) {
      // Remove tag (but keep at least one)
      if (value.length > 1) {
        onChange(value.filter((t) => t !== tag));
      }
    } else {
      // Add tag
      onChange([...value, tag]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => toggleTag(tag)}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
            value.includes(tag)
              ? "bg-white/30 text-white"
              : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

// Display-only tag badges for multiple tags
interface TagBadgesProps {
  tags: (InternalTag | ExternalTag)[];
  className?: string;
}

export function TagBadges({ tags, className }: TagBadgesProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white/90"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
