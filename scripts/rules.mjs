// The wording and truth rules from AGENTS.md, shared by check-site.mjs (the website) and make-tailored-cv.mjs
// (CVs and resumes tailored to one job). Each rule is [what is wrong, pattern].

// claims that must never appear anywhere visitors or employers read
export const claimRules = [
  ['old CGPA', /\b3\.34\b/],
  ['"First Division" claim', /first division/i],
  ['festival voucher', /voucher/i],
  ['date of birth', /date of birth|december 0?7,? 2001/i],
  ['festival ID number', /868e6193/i],
  ['AI attribution', /\bclaude\b|co-authored-by|generated with|anthropic|chatgpt|openai/i],
  ['"published" research claim', /\bpublished (paper|research|study)\b|journal article|peer[- ]reviewed paper/i],
  ['causal claim', /inflation (causes|raises|lowers|reduces|increases) /i],
  // the owner keeps the cement company in the cost-optimization project unnamed ("a listed Pakistani cement producer")
  ['cement company name', /\bfauji\b|\bfccl\b/i],
  // the owner doesn't want the IOFS master's scholarship mentioned anywhere
  ['scholarship claim', /50\s?% (master's )?scholarship|master's scholarship/i],
  // the owner doesn't want the 2026 Olympiad mentioned anywhere
  ['2026 Olympiad mention', /VI International Olympiad|Olympiad on Financial Security 2026|eliminatory round/i],
  // the festival talk on financial fraud (Sep 2026) was a student speaker's talk, not based on his research
  ['festival talk called research', /research on financial fraud/i],
  // the BRICS Arts Festival (Nov 2025) was participation only: not an award, not a financial security programme
  ['BRICS award claim', /award for (excellence in )?financial data interpretation/i],
  ['BRICS called a financial security programme', /financial security programme|global financial security event/i],
];

export const wordRules = [
  ['emoji', /\p{Extended_Pictographic}/u],
  ['banned word', /\b(passionate|leverag(e|ed|ing)|spearhead(ed)?|cutting-edge|synerg(y|ies)|delve|unlock|results-driven|world-class|game-changer|seamless(ly)?)\b/i],
];
