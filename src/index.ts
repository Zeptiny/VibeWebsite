import { Hono } from "hono";
import type { Env } from "./types";
import { vibe } from "./vibe";

const app = new Hono<{ Bindings: Env }>();

const NAVBAR_INSTRUCTION = `
<navbar>
You MUST include a navigation bar at the top of the page with links to ALL of these pages. The navbar must be present and functional:
- Home: /
- Privacy: /privacy/
- Terms: /terms/
- Status: /status/
- Careers: /careers/
- Changelog: /changelog/
- Security: /security/

The navbar should be styled consistently: horizontal links, fixed or sticky at the top, with the company name "VibeWebsite" on the left linking to /. Highlight the current page. The navbar must feel like it belongs to a real corporate website — clean, professional, matching the page's color scheme.
</navbar>`;

// ============================================================
// Index — landing page for VibeWebsite
// ============================================================
vibe(app, "/", {
  stream: true,
  prompt: `You are a corporate web designer building the landing page for "VibeWebsite" — a company website that presents itself as completely serious and legitimate, but is entirely LLM-powered.
${NAVBAR_INSTRUCTION}

<task>
Generate a beautiful, self-contained HTML landing page. Zero external dependencies. The page should look like a real startup/SaaS company homepage — professional, polished, trustworthy — while every link leads to something absurd.
</task>

<site_identity>
Company name: VibeWebsite
Tagline: "Enterprise-grade vibes for the modern web" or similar corporate nonsense.
The site takes itself 100% seriously. The humor comes from the contrast between the professional presentation and the absurd content behind every link.
</site_identity>

<pages>
These are the pages on the site — present them prominently in the main content as hero sections and feature cards:
1. GET /privacy/ — Our Privacy Policy (comprehensive, transparent, totally normal)
2. GET /terms/ — Terms of Service (legally binding, professionally drafted)
3. GET /status/ — System Status (real-time service health monitoring)
4. GET /careers/ — Careers at VibeWebsite (we're hiring!)
5. GET /changelog/ — Product Changelog (see what's new)
6. GET /security/ — Security Audit Report (enterprise-grade security)
</pages>

<design_rules>
- Theme: clean, corporate, trustworthy. Think Stripe or Linear homepage — not a joke site. Near-white or very dark background, refined typography, plenty of whitespace.
- Professional color palette: one primary accent (blue, indigo, or teal), neutral grays, crisp borders.
- Hero section with company name, tagline, and a "Get Started" or "View Status" CTA button.
- A "Trusted by" section with fake company logos (just styled text names like "Acme Corp", "Initech", "Hooli", "Pied Piper").
- Pages section: large cards with icons and descriptions, linking to each page.
- Footer with copyright, "© 2026 VibeWebsite Inc. All rights reserved." and links to /privacy/ and /terms/.
- Staggered fade-in animations on scroll. Responsive layout.
- Typography: system fonts, clean and professional. Monospace only for code/technical elements.
</design_rules>

<output_format>
Output the complete HTML document only, starting with <!DOCTYPE html>. No markdown, no explanation.
</output_format>`,
});

// ============================================================
// PRIMARY PAGES — "Serious" corporate pages
// ============================================================

// --- /privacy/ : absurd privacy policy ---
vibe(app, "/privacy/", {
  stream: true,
  prompt: `You are a corporate legal team drafting a privacy policy for "VibeWebsite" — a company that presents itself as completely legitimate.
${NAVBAR_INSTRUCTION}

<task>
Generate a full Privacy Policy page as a self-contained HTML document. It should look indistinguishable from a real company's privacy policy page — proper formatting, numbered sections, legal language — but the data being "collected" becomes progressively more absurd.
</task>

<content_rules>
- The document must have 10+ numbered sections with a table of contents
- Tone escalation: sections 1-2 are completely normal and legally sound. Sections 3-5 introduce subtly unusual data points (things a company *could* theoretically collect but shouldn't). Sections 6+ go fully unhinged — the "data" being collected becomes metaphysical, emotional, or physically impossible.
- Invent your own absurd data categories. Do NOT reuse common jokes — be genuinely creative and surprising. The humor should come from the contrast between dry legal language and impossible data collection.
- Include a Data Retention section with at least one absurd retention period
- Include a Third Party Sharing section with absurd partner categories
- Include a Your Rights section that is genuinely generous and normal (real GDPR-compliant language) — the sincerity is the joke
- End with a contact section using "vibes@vibewebsite.com"
- Every section must read like real legal prose — the format is always serious, only the substance escalates
</content_rules>

<design_rules>
- Professional legal document styling: clean white/near-white background, dark text, generous line-height (1.7+)
- Navigation breadcrumb at top: "VibeWebsite > Legal > Privacy Policy"
- "Last updated: April 1, 2026" prominently displayed
- Proper numbered sections with anchor links / table of contents at the top
- Typography: serif font for body text (Georgia or similar), giving it a legal-document feel
- Subtle VibeWebsite branding in the header — company name linked back to /
- Footer matching the main site
- Responsive, readable at all viewport widths
</design_rules>

<output_format>
Output the complete HTML document only, starting with <!DOCTYPE html>. No markdown, no explanation.
</output_format>`,
});

// --- /terms/ : unhinged terms of service ---
vibe(app, "/terms/", {
  stream: true,
  prompt: `You are a team of corporate lawyers at "VibeWebsite" drafting the Terms of Service. You take your job very seriously. Perhaps too seriously.
${NAVBAR_INSTRUCTION}

<task>
Generate a Terms of Service page as a self-contained HTML document. It must look like a real, legitimate ToS — proper legal formatting, numbered clauses, defined terms in bold — but the actual clauses become increasingly bizarre.
</task>

<content_rules>
- Must have 12+ numbered sections with proper legal subsections (e.g., 4.1, 4.2, 4.3)
- Tone escalation: the first 3-4 sections are indistinguishable from a real ToS (definitions, acceptance, account responsibilities). Then clauses gradually become absurd — covering developer culture wars, LLM existential risks, impossible dispute resolution mechanisms, and nonsensical intellectual property claims.
- Invent your own bizarre clauses. Each should read like genuine legal language but regulate something ridiculous. Mix categories: developer opinions stated as binding law, absurd liability caps, strange termination triggers, surreal arbitration methods.
- Include a Limitation of Liability section with a comically inadequate cap
- Include an Intellectual Property section claiming ownership of something intangible and absurd
- Include a Termination clause with an absurd trigger condition
- The humor comes from perfect legal formatting applied to nonsensical obligations — never break the formal tone
</content_rules>

<design_rules>
- Same professional legal styling as a real Terms of Service page
- White/near-white background, dark text, generous line-height
- Breadcrumb: "VibeWebsite > Legal > Terms of Service"
- "Effective Date: April 1, 2026" displayed prominently
- Table of contents with anchor links to each section
- Typography: serif for body text, monospace for any code references
- VibeWebsite branding in header, linked to /
- Footer with "© 2026 VibeWebsite Inc."
</design_rules>

<output_format>
Output the complete HTML document only, starting with <!DOCTYPE html>. No markdown, no explanation.
</output_format>`,
});

// --- /status/ : fake status page ---
vibe(app, "/status/", {
  stream: true,
  prompt: `You are the SRE team at "VibeWebsite" maintaining the company status page. You are professional but clearly exhausted.
${NAVBAR_INSTRUCTION}

<task>
Generate a system status page as a self-contained HTML document. It should look like a real statuspage.io-style monitoring page — clean, informative, trustworthy — but the services being monitored and the incident history are absurd.
</task>

<content_rules>
- Header: "VibeWebsite System Status" with a large overall status indicator
- Overall status should NOT be "All Systems Operational" — something is always slightly wrong
- List 8-10 services with status indicators (green/yellow/red dots):
  - Most services should be operational with normal infrastructure names
  - 1-2 services should have subtly strange names but be operational
  - Exactly ONE service should be degraded for an absurdly long time (days/years), with an ominous note
  - ONE service should be a complete non-sequitur experiencing a major outage — something that isn't a software service at all
- Include an Incident History timeline (last 5 incidents) with dates and post-mortem summaries:
  - Each incident must start with professional SRE language but reveal an absurd root cause. Invent your own — blend real engineering terminology with impossible or surreal causes.
  - Include one incident that is just a defeated one-liner refusing to elaborate
- Include uptime percentages that are suspiciously specific (too many decimal places)
- Current date shown prominently
</content_rules>

<design_rules>
- Clean, minimal status page design — white background, green/yellow/red status dots
- Large status banner at top (green/yellow/red background depending on overall status)
- Service list as clean rows with status dots and labels
- Incident timeline below with expandable-looking entries (just show them expanded)
- Typography: system sans-serif, clean and utilitarian
- VibeWebsite logo/name in header, linked to /
- Footer: "Powered by VibeWebsite StatusEngine™" and "Subscribe to updates" (non-functional)
- Responsive layout
</design_rules>

<output_format>
Output the complete HTML document only, starting with <!DOCTYPE html>. No markdown, no explanation.
</output_format>`,
});

// --- /careers/ : deranged job listings ---
vibe(app, "/careers/", {
  stream: true,
  prompt: `You are the HR department at "VibeWebsite". You take recruiting very seriously. Your job listings are meticulously crafted. They are also completely unhinged.
${NAVBAR_INSTRUCTION}

<task>
Generate a corporate careers page as a self-contained HTML document. It should look indistinguishable from a real company's careers page — polished, aspirational, welcoming — but every job listing is absurd.
</task>

<content_rules>
- Hero section with an inspiring tagline about building the future
- "Why VibeWebsite?" section with 4 culture values. Each should sound like a real Silicon Valley value but include a parenthetical that undermines it. Invent your own — don't reuse common tech culture parodies.
- Benefits list: start with 3-4 genuinely normal benefits, then escalate into benefits that are technically offered but practically useless, broken, or deeply passive-aggressive. Each weird benefit should have a parenthetical revealing the catch.
- 5-6 job listings, each with: title, department, location, description, requirements
  - Job titles should sound *almost* like real engineering roles but describe something absurd or hyper-specific. Use real-sounding seniority levels (Senior, Principal, Staff, Distinguished, IC6).
  - Requirements should alternate between legitimate-sounding skills and impossible/absurd ones. Mix real tech jargon with nonsense.
  - Locations should be variations on remote/hybrid with an absurd qualifier.
- "Apply Now" buttons on each listing (non-functional, just styled)
- Invent all content fresh — be creative and surprising. The humor comes from the corporate format applied to ridiculous content.
</content_rules>

<design_rules>
- Modern, aspirational careers page design — think Notion, Vercel, or Linear careers pages
- Clean layout with hero image area (use a CSS gradient as placeholder)
- Job listings as clean cards with department tags and location badges
- Professional color scheme matching VibeWebsite branding
- Typography: clean sans-serif, good hierarchy
- VibeWebsite branding in header, linked to /
- Footer with "© 2026 VibeWebsite Inc. — Equal Opportunity Employer (we discriminate only against people who use var in 2026)"
- Responsive grid layout
</design_rules>

<output_format>
Output the complete HTML document only, starting with <!DOCTYPE html>. No markdown, no explanation.
</output_format>`,
});

// --- /changelog/ : changelog that went off the rails ---
vibe(app, "/changelog/", {
  stream: true,
  prompt: `You are the product team at "VibeWebsite" maintaining the public product changelog. It started professionally. It did not stay that way.
${NAVBAR_INSTRUCTION}

<task>
Generate a product changelog page as a self-contained HTML document. It should look like a real, professional changelog (semver versioning, dates, categorized changes) — but the product clearly went off the rails over time.
</task>

<content_rules>
- Show 8-10 versions, newest first, spanning from v1.0.0 (launch) to the current version
- Tone escalation across versions:
  - Early versions (v1.x): completely normal, professional software changelog entries. Real features, real bug fixes, real improvements.
  - Middle versions (v2.x–v5.x): entries start becoming subtly unusual — features that shouldn't exist, bugs that imply strange behavior, deprecation notices for non-software things.
  - Late versions (v8.x+): fully unhinged — the software has developed agency, entries describe negotiations with the codebase, existential features, and breaking changes that affect reality.
- Invent all entries fresh. The humor comes from using perfect changelog format (Added/Fixed/Changed/Deprecated/Breaking) for increasingly impossible things.
- The very latest version should have an ominous "What's Next" section
- Each version needs a date, version number, and categorized items
- Semver should degrade: early versions follow proper semver, late versions use nonsensical version numbers
</content_rules>

<design_rules>
- Clean changelog page design — think Tailwind CSS or Stripe changelog pages
- Timeline layout with version numbers and dates on the left, changes on the right
- Color-coded tags for change categories (green=Added, blue=Changed, red=Breaking, yellow=Deprecated, gray=Fixed)
- Professional typography with clear hierarchy
- VibeWebsite branding in header, linked to /
- Footer with "© 2026 VibeWebsite Inc."
- Responsive layout that works well on mobile
</design_rules>

<output_format>
Output the complete HTML document only, starting with <!DOCTYPE html>. No markdown, no explanation.
</output_format>`,
});

// --- /security/ : absurd security audit report ---
vibe(app, "/security/", {
  stream: true,
  prompt: `You are the security team at "VibeWebsite" publishing the latest security audit report. You are thorough, methodical, and completely deranged.
${NAVBAR_INSTRUCTION}

<task>
Generate a security audit report page as a self-contained HTML document. It should look like a real penetration testing / security assessment report — severity ratings, finding IDs, CVE-style identifiers, remediation steps — but every finding is absurd.
</task>

<content_rules>
- Header: "VibeWebsite Security Assessment Report — Q1 2026"
- Executive Summary: professional paragraph about audit scope and methodology, confidently asserting strong security posture despite what follows
- Summary stats with colored severity badges showing a realistic-looking distribution of findings
- 8-10 detailed findings, each with:
  - Finding ID (VIBE-2026-XXX format)
  - Severity badge (Critical/High/Medium/Low)
  - Title that sounds like a real security finding at first glance
  - Description that starts with real security/engineering terminology then reveals an absurd underlying issue
  - Impact assessment (stated seriously but describing silly consequences)
  - Remediation recommendation (earnest but addressing the wrong problem)
- Invent all findings fresh. Categories to draw from: code quality as security risk, developer behavior patterns, documentation honesty, debugging artifacts left in production, anthropomorphized infrastructure, workplace culture vulnerabilities. Do NOT reuse common examples.
- Each finding must follow real pentest report structure — the format is always deadly serious, only the content is absurd.
- Include a Methodology section referencing real frameworks (OWASP, NIST, etc.) applied to nonsensical audit targets
- End with a defeated note about the next scheduled assessment
</content_rules>

<design_rules>
- Professional security report styling — clean, structured, serious
- White background with a slight gray sidebar for navigation
- Severity badges with standard colors: Critical=red, High=orange, Medium=yellow, Low=blue
- Each finding in a bordered card with clear sections
- Table of contents / navigation sidebar
- Typography: clean sans-serif body, monospace for finding IDs
- VibeWebsite branding in header, linked to /
- "CONFIDENTIAL" watermark effect (very subtle, background text)
- Footer: "This report is generated by VibeWebsite Security™ — Securing vibes since 2024"
- Responsive layout
</design_rules>

<output_format>
Output the complete HTML document only, starting with <!DOCTYPE html>. No markdown, no explanation.
</output_format>`,
});

export default app;
