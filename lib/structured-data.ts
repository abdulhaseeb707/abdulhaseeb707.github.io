// Structured data (schema.org JSON-LD) that tells search engines who the site is about and what each page is.
// Everything comes from content/profile.yaml, so the truth rules in AGENTS.md apply here too: no "economist",
// the paper is a working paper and not peer reviewed, and the cement company stays unnamed.
import { profile, site } from './profile';
import { img } from './images';

const { person, contact, research, seo } = profile;

const abs = (path: string) => new URL(path, site.url).href;
const ids = { person: `${site.url}/#person`, website: `${site.url}/#website` };
const cvSection = (title: string) => profile.cv.sections.find((s) => s.title === title)?.entries ?? [];

/** The site and its owner; on every page. */
export function siteGraph() {
  const university = (e: { org?: string }) => e.org?.split(',')[0].trim();
  const universities = [...new Set(cvSection('Education').map(university).filter(Boolean))];
  const studyingAt = [...new Set(cvSection('Education').filter((e) => e.dates?.includes('present')).map(university).filter(Boolean))];
  const awards = cvSection('Honours and awards').map((e) => [e.title, e.org].filter(Boolean).join(', ') + (e.dates ? ` (${e.dates})` : ''));
  const memberships = cvSection('Memberships and certifications')
    .filter((e) => e.title.startsWith('Member, '))
    .map((e) => ({ '@type': 'Organization', name: e.title.replace(/^Member, /, '') }));
  const knowsAbout = ['Economics', ...profile.skills.flatMap((g) => g.items.map((i) => i.replace(/\s*\(.*\)$/, '')))];

  return [
    {
      '@type': 'WebSite',
      '@id': ids.website,
      url: `${site.url}/`,
      name: person.name,
      inLanguage: 'en',
      publisher: { '@id': ids.person },
    },
    {
      '@type': 'Person',
      '@id': ids.person,
      name: person.name,
      url: `${site.url}/`,
      image: abs(img(person.portrait).src),
      description: person.label,
      // tells search engines and AI answers which Abdul Haseeb Khan this is
      ...(seo.person ? { disambiguatingDescription: seo.person } : {}),
      homeLocation: { '@type': 'Place', name: person.location },
      affiliation: studyingAt.map((name) => ({ '@type': 'CollegeOrUniversity', name })),
      alumniOf: universities.map((name) => ({ '@type': 'CollegeOrUniversity', name })),
      memberOf: memberships,
      award: awards,
      knowsAbout: [...new Set(knowsAbout)],
      knowsLanguage: profile.languages.map((l) => l.name),
      // every profile that is the owner's, so Google treats them as one person
      sameAs: [contact.linkedin, contact.github, contact.scholar, contact.orcid].filter(Boolean),
      ...(contact.orcid
        ? { identifier: { '@type': 'PropertyValue', propertyID: 'ORCID', value: contact.orcid.replace('https://orcid.org/', '') } }
        : {}),
    },
  ];
}

const breadcrumbs = (name: string, path: string) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
    { '@type': 'ListItem', position: 2, name, item: abs(path) },
  ],
});

/** The home page: a profile page about the owner. */
export function homeGraph() {
  return [
    {
      '@type': 'ProfilePage',
      '@id': `${site.url}/#profilepage`,
      url: `${site.url}/`,
      name: seo.home.title,
      description: seo.home.description,
      isPartOf: { '@id': ids.website },
      mainEntity: { '@id': ids.person },
      image: abs('/og/home.png'),
    },
  ];
}

/** The research page: the working paper (not peer reviewed). */
export function researchGraph() {
  const url = abs(site.researchPage);
  const pdfs = research.links.filter((l) => /PDF/i.test(l.note ?? ''));
  return [
    {
      '@type': 'ScholarlyArticle',
      '@id': `${url}#paper`,
      name: research.paperTitle,
      headline: research.title,
      description: seo.research.description,
      creativeWorkStatus: research.status,
      author: { '@id': ids.person },
      url,
      mainEntityOfPage: url,
      image: abs('/og/research.png'),
      inLanguage: 'en',
      isAccessibleForFree: true,
      // the topics first, then the tools (research.tags)
      keywords: ['Inflation', 'Corporate profitability', 'Return on assets', ...research.tags].join(', '),
      encoding: pdfs.map((l) => ({
        '@type': 'MediaObject',
        name: l.label.replace(/^Read the /, 'The '),
        contentUrl: l.url,
        encodingFormat: 'application/pdf',
      })),
    },
    breadcrumbs(research.title, site.researchPage),
  ];
}

/** A project page. */
export function projectGraph(slug: string) {
  const p = profile.projects.find((x) => x.slug === slug)!;
  const url = abs(site.projectPage(slug));
  const repo = p.links.find((l) => l.url.startsWith('https://github.com/'));
  return [
    {
      '@type': 'CreativeWork',
      '@id': `${url}#project`,
      name: p.title,
      description: seo.projects[slug].description,
      genre: p.kind,
      author: { '@id': ids.person },
      url,
      mainEntityOfPage: url,
      image: abs(`/og/${slug}.png`),
      inLanguage: 'en',
      isAccessibleForFree: true,
      keywords: p.tags.join(', '),
      ...(repo ? { hasPart: { '@type': 'SoftwareSourceCode', name: `${p.title}: code`, codeRepository: repo.url } } : {}),
    },
    breadcrumbs(p.title, site.projectPage(slug)),
  ];
}

/** The CV page, with the PDF. */
export function cvGraph() {
  const url = abs(site.cvPage);
  return [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: `CV of ${person.name}`,
      description: seo.cv.description,
      isPartOf: { '@id': ids.website },
      about: { '@id': ids.person },
      image: abs('/og/cv.png'),
      associatedMedia: { '@type': 'MediaObject', name: `${person.name}, CV (PDF)`, contentUrl: abs('/Abdul-Haseeb-Khan-CV.pdf'), encodingFormat: 'application/pdf' },
    },
    breadcrumbs('CV', site.cvPage),
  ];
}
