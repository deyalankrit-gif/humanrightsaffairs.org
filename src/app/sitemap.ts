import { MetadataRoute } from 'next'

/**
 * Dynamic Sitemap Generator: Enterprise level routing coverage.
 * Automatically covers all institutional portals, legal formats, and hub nodes.
 */
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
    '/activity-hub/calendar',
    '/kit-management',
    '/activity-calendar',
    '/complaint-form',
    '/legal/pro-bono',
    '/legal/fir-format',
    '/legal/rti-assistant',
    '/legal/bail-procedure',
    '/legal/privacy-policy',
    '/legal/agm-format',
    '/legal/annual-governance-checklist',
    '/legal/official-representation',
    '/legal/required-documents',
    '/legal/resolution-format',
    '/legal/quotation-format',
    '/legal/police-duties',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}