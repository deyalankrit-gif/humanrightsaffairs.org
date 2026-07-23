
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.hrat-india.org'
  const lastModified = new Date()

  const routes = [
    '',
    '/events',
    '/gallery',
    '/leadership',
    '/members',
    '/terminated-members',
    '/report-a-complaint',
    '/legal-aid',
    '/donors',
    '/trust-credentials',
    '/trust-responsibilities',
    '/activity-hub',
    '/kit-management',
    '/legal/pro-bono',
    '/legal/fir-format',
    '/legal/rti-assistant',
    '/legal/bail-procedure',
    '/legal/privacy-policy',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
