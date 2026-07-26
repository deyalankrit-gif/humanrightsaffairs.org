import { MetadataRoute } from 'next'

/**
 * Enterprise Robots Configuration: Protects administrative nodes while ensuring public index fidelity.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/internal/',
          '/login/',
          '/api/',
          '/*?*', // Block search queries from indexing
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'Google-InspectionTool',
        allow: '/',
      }
    ],
    sitemap: 'https://www.hrat-india.org/sitemap.xml',
  }
}
