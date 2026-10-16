'use client';

import { useState } from 'react';

const lineClampClass = {
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
};

type ExpandableTextProps = {
  text: string;
  className?: string;
  collapsedLines?: 2 | 3 | 4;
  threshold?: number;
  buttonClassName?: string;
};

export default function ExpandableText({
  text,
  className = '',
  collapsedLines = 3,
  threshold = 70,
  buttonClassName = '',
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = text.trim().length > threshold;

  return (
    <div>
      <p className={`${className} ${canExpand && !expanded ? `${lineClampClass[collapsedLines]} sm:line-clamp-none` : ''}`}>
        {text}
      </p>
      {canExpand && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(value => !value)}
          className={`mt-2 min-h-11 rounded-lg px-3 text-xs font-bold sm:hidden ${buttonClassName}`}
        >
          {expanded ? '접기' : '더보기'}
        </button>
      )}
    </div>
  );
}
