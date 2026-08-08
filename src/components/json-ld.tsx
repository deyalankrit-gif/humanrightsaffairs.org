import React from 'react';

/**
 * JsonLd Component: Safely injects structured data into the page.
 * Shared Component: Can be used in both Server and Client contexts.
 * This ensures it can be rendered statically in the layout head without requiring a client chunk.
 */
export function JsonLd({ data }: { data: any }) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
