// The CV as a PDF, drawn with react-pdf from the same content as the website (content/profile.yaml).
// The owner chose the "academic" style: one serif (Source Serif 4), a centred name, ruled small headings, the
// title and dates on one line, the organisation in italics, and nothing else. Black and greys only.
// Pure JavaScript: no browser needed, so it renders the same at build time and on the Oracle server.
import path from 'node:path';
import { Document, Page, Text, View, Link, Font, StyleSheet } from '@react-pdf/renderer';
import { profile, site } from '../profile';

const font = (name: string) => path.join(process.cwd(), 'node_modules', '@fontsource', 'source-serif-4', 'files', `source-serif-4-latin-${name}.woff`);
Font.register({
  family: 'Source Serif 4',
  fonts: [
    { src: font('400-normal'), fontWeight: 400 },
    { src: font('400-italic'), fontWeight: 400, fontStyle: 'italic' },
    { src: font('600-normal'), fontWeight: 600 },
    { src: font('600-italic'), fontWeight: 600, fontStyle: 'italic' },
  ],
});
Font.registerHyphenationCallback((word) => [word]); // never hyphenate names or numbers

const C = { text: '#161616', soft: '#333333', grey: '#444444', sep: '#9a9a9a', rule: '#222222', link: '#aaaaaa' };

const s = StyleSheet.create({
  // ligatures off: joined 'fi'/'fl' glyphs copy out of the PDF as missing letters, which breaks CV parsers
  page: { paddingTop: 40, paddingBottom: 40, paddingHorizontal: 50, fontFamily: 'Source Serif 4', fontSize: 9.3, lineHeight: 1.38, color: C.text, fontFeatureSettings: { liga: false, clig: false } },
  head: { alignItems: 'center' },
  name: { fontSize: 22, letterSpacing: 0.6, lineHeight: 1.15 },
  tag: { marginTop: 2, fontSize: 10, fontStyle: 'italic', color: C.grey },
  contact: { marginTop: 6, fontSize: 8.8, color: C.soft, textAlign: 'center' },
  sep: { color: C.sep },
  plain: { color: C.soft, textDecoration: 'none' },

  section: { marginTop: 12 },
  // modest letter-spacing: wider gaps make PDF readers (and CV-screening software) read "P R O F I L E"
  heading: { fontSize: 9, fontWeight: 600, letterSpacing: 0.6, paddingBottom: 2, marginBottom: 6, borderBottomWidth: 0.6, borderBottomColor: C.rule },
  summary: { textAlign: 'justify' },

  entry: { marginTop: 6 },
  first: { marginTop: 0 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { flex: 1, fontWeight: 600, paddingRight: 14 },
  dates: { fontStyle: 'italic', color: C.grey },
  org: { fontStyle: 'italic', color: C.soft },
  bullets: { marginTop: 2, paddingLeft: 4 },
  bullet: { flexDirection: 'row', marginTop: 1 },
  dot: { width: 9, color: '#555555' },
  bulletText: { flex: 1 },
  link: { marginTop: 2, fontSize: 8.6, color: C.soft, textDecoration: 'underline', textDecorationColor: C.link },

  pair: { flexDirection: 'row', marginBottom: 2 },
  key: { width: 62, fontWeight: 600 },
  value: { flex: 1 },
});

// The PDF's order and headings. The keys are the section titles in profile.yaml; sections not listed follow at the end.
const ORDER: [string, string][] = [
  ['Education', 'Education'],
  ['Experience', 'Experience'],
  ['Research', 'Research'],
  ['Honours and awards', 'Honours and awards'],
  ['Conferences and programmes', 'Conferences and programmes'],
  ['Other projects', 'Projects'],
  ['Memberships and certifications', 'Memberships and certifications'],
];

type Entry = (typeof profile.cv.sections)[number]['entries'][number];
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

function Heading({ children }: { children: string }) {
  return <Text style={s.heading}>{children.toUpperCase()}</Text>;
}

function EntryView({ e, first }: { e: Entry; first?: boolean }) {
  return (
    <View style={first ? [s.entry, s.first] : s.entry} wrap={false}>
      <View style={s.row}>
        <Text style={s.title}>{e.title}</Text>
        {e.dates ? <Text style={s.dates}>{e.dates}</Text> : null}
      </View>
      {e.org ? <Text style={s.org}>{e.org}</Text> : null}
      {e.bullets.length ? (
        <View style={s.bullets}>
          {e.bullets.map((b) => (
            <View key={b} style={s.bullet}>
              <Text style={s.dot}>•</Text>
              <Text style={s.bulletText}>{b}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {e.link ? <Link style={s.link} src={e.link}>{e.linkLabel ?? bare(e.link)}</Link> : null}
    </View>
  );
}

export function CvDocument() {
  const { person, contact, cv, skills, languages } = profile;
  const known = new Set(ORDER.map(([key]) => key));
  const sections = [
    ...ORDER.flatMap(([key, heading]) => {
      const found = cv.sections.find((x) => x.title === key);
      return found ? [{ ...found, heading }] : [];
    }),
    ...cv.sections.filter((x) => !known.has(x.title)).map((x) => ({ ...x, heading: x.title })),
  ]
    .map((x) => ({ ...x, entries: x.entries.filter((e) => e.pdf) }))
    .filter((x) => x.entries.length);

  const contacts = [
    cv.showPhone && contact.phone ? <Text key="phone">{contact.phone}</Text> : null,
    <Link key="mail" style={s.plain} src={`mailto:${contact.email}`}>{contact.email}</Link>,
    <Link key="in" style={s.plain} src={contact.linkedin}>{bare(contact.linkedin)}</Link>,
    <Link key="web" style={s.plain} src={site.url}>{bare(site.url)}</Link>,
  ].filter(Boolean);

  return (
    <Document title={`${person.name}, CV`} author={person.name} subject="Curriculum vitae" creator={person.name} producer={person.name}>
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          <Text style={s.name}>{person.name}</Text>
          <Text style={s.tag}>{person.label}</Text>
          <Text style={s.contact}>
            {contacts.map((c, i) => (
              <Text key={i}>
                {i > 0 ? <Text style={s.sep}>{'   |   '}</Text> : null}
                {c}
              </Text>
            ))}
          </Text>
        </View>

        <View style={s.section}>
          <Heading>Profile</Heading>
          <Text style={s.summary}>{cv.summary}</Text>
        </View>

        {sections.map((section) => {
          const [first, ...rest] = section.entries;
          return (
            <View key={section.title} style={s.section}>
              {/* the heading always moves to the next page together with its first entry */}
              <View wrap={false}>
                <Heading>{section.heading}</Heading>
                <EntryView e={first} first />
              </View>
              {rest.map((e) => <EntryView key={e.title} e={e} />)}
            </View>
          );
        })}

        <View style={s.section} wrap={false}>
          <Heading>Skills and languages</Heading>
          {skills.map((g) => (
            <View key={g.group} style={s.pair}>
              <Text style={s.key}>{g.group}</Text>
              <Text style={s.value}>{g.items.join(', ')}</Text>
            </View>
          ))}
          <View style={s.pair}>
            <Text style={s.key}>Languages</Text>
            <Text style={s.value}>{languages.map((l) => `${l.name} (${l.level})`).join('; ')}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
