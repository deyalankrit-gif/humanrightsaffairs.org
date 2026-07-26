/**
 * @fileOverview Modular SEO Utilities for Human Rights Affairs Trust.
 * Generates validated JSON-LD structured data for various entities.
 */

export const SEO_CONSTANTS = {
  orgName: 'Human Rights Affairs Trust (Justice Shield)',
  alternateName: 'HRAT India',
  url: 'https://www.hrat-india.org',
  logo: 'https://www.hrat-india.org/HRAT%20Logo.jpeg',
  description: 'Human Rights Affairs Trust (Justice Shield) is a Central Government Registered Human Rights Organization in India (Reg. No. WB/2025/0762605).',
  registration: 'WB/2025/0762605',
  nitiAayogId: 'WB/2025/0762605',
  helpline: '+91-89811-52748',
  email: 'humanrightsaffairstrust@gmail.com',
};

/**
 * Generates Organization/NGO JSON-LD
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    'name': SEO_CONSTANTS.orgName,
    'alternateName': SEO_CONSTANTS.alternateName,
    'url': SEO_CONSTANTS.url,
    'logo': SEO_CONSTANTS.logo,
    'description': SEO_CONSTANTS.description,
    'taxID': SEO_CONSTANTS.registration,
    'identifier': SEO_CONSTANTS.nitiAayogId,
    'contactPoint': [
      {
        '@type': 'ContactPoint',
        'telephone': SEO_CONSTANTS.helpline,
        'contactType': 'customer service',
        'areaServed': 'IN',
        'availableLanguage': ['English', 'Hindi', 'Bengali'],
      },
    ],
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Azad Market',
      'addressLocality': 'Delhi',
      'postalCode': '110006',
      'addressCountry': 'IN',
    },
    'sameAs': [
      'https://www.facebook.com/humanrightsaffairstrust',
      'https://www.instagram.com/humanrightsaffairstrust',
    ],
  };
}

/**
 * Generates NewsArticle JSON-LD
 */
export function getNewsSchema(newsItem: any) {
  if (!newsItem) return null;
  const title = newsItem.originalEnglish?.title || newsItem.title;
  const content = newsItem.originalEnglish?.content || newsItem.content;
  const date = newsItem.createdAt?.toDate ? newsItem.createdAt.toDate().toISOString() : new Date().toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': title,
    'description': content,
    'datePublished': date,
    'dateModified': date,
    'author': {
      '@type': 'Organization',
      'name': SEO_CONSTANTS.orgName,
    },
    'publisher': {
      '@type': 'Organization',
      'name': SEO_CONSTANTS.orgName,
      'logo': {
        '@type': 'ImageObject',
        'url': SEO_CONSTANTS.logo,
      },
    },
  };
}

/**
 * Generates Event JSON-LD
 */
export function getEventSchema(event: any) {
  if (!event) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': event.title,
    'description': event.description,
    'startDate': event.date,
    'location': {
      '@type': 'Place',
      'name': event.location,
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': event.districtName || 'National',
        'addressRegion': event.stateName || 'India',
        'addressCountry': 'IN',
      },
    },
    'organizer': {
      '@type': 'Organization',
      'name': SEO_CONSTANTS.orgName,
    },
  };
}
