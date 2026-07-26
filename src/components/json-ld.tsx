'use client';

import React from 'react';

/**
 * JsonLd Component: Safely injects structured data into the page.
 * Future-proof: Only renders if valid data is provided.
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
