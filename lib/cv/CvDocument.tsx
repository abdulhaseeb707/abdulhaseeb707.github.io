// The CV as a PDF, drawn with react-pdf from the same content as the website (content/profile.yaml).
// Pure JavaScript: no browser needed, so it renders the same at build time and on the Oracle server.
import path from 'node:path';
import { Document, Page, Text, View, Link, Font, StyleSheet } from '@react-pdf/renderer';
import { profile, site } from '../profile';

const files = (pkg: string, name: string) => path.join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', name);
Font.register({ family: 'Instrument Serif', src: files('instrument-serif', 'instrument-serif-latin-400-normal.woff') });
Font.register({
  family: 'Geist',
  fonts: [
    { src: files('geist', 'geist-latin-400-normal.woff'), fontWeight: 400 },
    { src: files('geist', 'geist-latin-500-normal.woff'), fontWeight: 500 },
    { src: files('geist', 'geist-latin-600-normal.woff'), fontWeight: 600 },
  ],
});
Font.register({ family: 'Geist Mono', src: files('geist-mono', 'geist-mono-latin-400-normal.woff') });
Font.registerHyphenationCallback((word) => [word]); // never hyphenate names or numbers

// brass is for the rule lines; brassInk is the darker brass used for small text (readable contrast)
const C = { ink: '#111a2b', slate: '#4b5466', muted: '#656b79', hair: '#ddd7ca', brass: '#b7802a', brassInk: '#8a5f1d', forest: '#0e7a5a' };

const s = StyleSheet.create({
  // ligatures off: joined 'fi'/'fl' glyphs copy out of the PDF as missing letters, which breaks CV parsers
  page: { paddingTop: 38, paddingBottom: 46, paddingHorizontal: 44, fontFamily: 'Geist', fontSize: 8.8, lineHeight: 1.42, color: C.ink, fontFeatureSettings: { liga: false, clig: false } },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.brass },
  name: { fontFamily: 'Instrument Serif', fontSize: 27, lineHeight: 1 },
  role: { marginTop: 6, fontFamily: 'Geist Mono', fontSize: 7.2, letterSpacing: 1, color: C.forest },
  contact: { alignItems: 'flex-end', fontSize: 8, color: C.slate, lineHeight: 1.5 },
  link: { color: C.slate, textDecoration: 'none' },
  summary: { marginTop: 10, color: C.ink },
  section: { marginTop: 12 },
  sectionTitle: {
    fontFamily: 'Geist Mono', fontSize: 6.8, letterSpacing: 1.4, textTransform: 'uppercase', color: C.brassInk,
    paddingBottom: 3, marginBottom: 6, borderBottomWidth: 0.6, borderBottomColor: C.hair,
  },
  entry: { marginBottom: 6.5 },
  entryHead: { flexDirection: 'row', justifyContent: 'space-between' },
  entryTitle: { fontWeight: 600, fontSize: 9.2, maxWidth: '82%' },
  dates: { fontFamily: 'Geist Mono', fontSize: 7.4, color: C.muted, marginTop: 1.2 },
  org: { color: C.slate, fontSize: 8.4, marginTop: 0.5 },
  repo: { fontFamily: 'Geist Mono', fontSize: 7, color: C.forest, marginTop: 1, textDecoration: 'none' },
  bullet: { flexDirection: 'row', marginTop: 1.6 },
  dot: { width: 9, color: C.brass },
  bulletText: { flex: 1 },
  skillRow: { flexDirection: 'row', marginBottom: 3 },
  skillName: { width: 74, fontWeight: 500 },
  skillText: { flex: 1, color: C.ink },
  footerLeft: { position: 'absolute', bottom: 22, left: 44, fontFamily: 'Geist Mono', fontSize: 6.8, color: C.muted },
  footerRight: { position: 'absolute', bottom: 22, right: 44, width: 60, textAlign: 'right', fontFamily: 'Geist Mono', fontSize: 6.8, color: C.muted },
});

const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

export function CvDocument() {
  const { person, contact, cv, skills, languages } = profile;
  return (
    <Document title={`${person.name}, CV`} author={person.name} subject="Curriculum vitae" creator={person.name} producer={person.name}>
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          <View>
            <Text style={s.name}>{person.name}</Text>
            <Text style={s.role}>ECONOMIST · {person.location.toUpperCase()}</Text>
          </View>
          <View style={s.contact}>
            <Link style={s.link} src={`mailto:${contact.email}`}>{contact.email}</Link>
            {cv.showPhone && contact.phone ? <Text>{contact.phone}</Text> : null}
            <Link style={s.link} src={contact.linkedin}>{bare(contact.linkedin)}</Link>
            <Link style={s.link} src={contact.github}>{bare(contact.github)}</Link>
            <Link style={s.link} src={site.url}>{bare(site.url)}</Link>
          </View>
        </View>

        <Text style={s.summary}>{cv.summary}</Text>

        {cv.sections.map((section) => (
          <View key={section.title} style={s.section}>
            <Text style={s.sectionTitle} minPresenceAhead={90}>{section.title}</Text>
            {section.entries.map((e) => (
              <View key={e.title} style={s.entry} wrap={false}>
                <View style={s.entryHead}>
                  <Text style={s.entryTitle}>{e.title}</Text>
                  {e.dates ? <Text style={s.dates}>{e.dates}</Text> : null}
                </View>
                {e.org ? <Text style={s.org}>{e.org}</Text> : null}
                {e.link ? <Link style={s.repo} src={e.link}>{bare(e.link)}</Link> : null}
                {e.bullets.map((b) => (
                  <View key={b} style={s.bullet}>
                    <Text style={s.dot}>·</Text>
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}

        <View style={s.section} wrap={false}>
          <Text style={s.sectionTitle}>Skills</Text>
          {skills.map((g) => (
            <View key={g.group} style={s.skillRow}>
              <Text style={s.skillName}>{g.group}</Text>
              <Text style={s.skillText}>{g.items.join(', ')}</Text>
            </View>
          ))}
          <View style={s.skillRow}>
            <Text style={s.skillName}>Languages</Text>
            <Text style={s.skillText}>{languages.map((l) => `${l.name} (${l.level})`).join('; ')}</Text>
          </View>
        </View>

        <Text style={s.footerLeft} fixed>{`${bare(site.url)} · updated ${site.built}`}</Text>
        <Text style={s.footerRight} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
}
