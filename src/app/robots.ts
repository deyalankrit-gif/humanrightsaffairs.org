
import { MetadataRoute } from 'next'

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
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
    ],
    sitemap: 'https://www.hrat-india.org/sitemap.xml',
  }
}
