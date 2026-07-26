export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalPageData = {
  slug: "privacy" | "terms" | "ethics";
  eyebrow: string;
  title: string;
  deck: string;
  updated: string;
  sections: LegalSection[];
};

export const legalNav = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/ethics", label: "Ethics" },
] as const;

export const privacyPage: LegalPageData = {
  slug: "privacy",
  eyebrow: "Your data · Our responsibility",
  title: "Privacy Policy",
  deck: "How Education News Network collects, uses, and protects information when you visit our website, subscribe to updates, or contact our newsroom.",
  updated: "July 14, 2026",
  sections: [
    {
      id: "overview",
      title: "Overview",
      paragraphs: [
        "Education News Network (“ENN,” “we,” “us”) respects your privacy. This policy explains what information we collect, why we collect it, and the choices you have.",
        "By using ennnews.com and related services, you agree to the practices described here. If you do not agree, please discontinue use of the site.",
      ],
    },
    {
      id: "information-we-collect",
      title: "Information we collect",
      paragraphs: ["We may collect the following categories of information:"],
      bullets: [
        "Contact details you provide — such as name, email address, phone number, and message content — when you use our contact form, newsletter signup, or event registration.",
        "Account or admin credentials for authorized staff using our admin tools.",
        "Technical data such as IP address, browser type, device information, pages viewed, and referring URLs, collected through standard server logs and analytics.",
        "Cookies and similar technologies that help the site remember preferences and measure performance.",
      ],
    },
    {
      id: "how-we-use",
      title: "How we use information",
      paragraphs: ["We use personal information to:"],
      bullets: [
        "Respond to inquiries, tips, and partnership requests.",
        "Deliver newsletters and service updates you have opted into.",
        "Improve site performance, security, and editorial product quality.",
        "Operate events, panel discussions, and related ENN programs.",
        "Comply with legal obligations and protect our rights and users.",
      ],
    },
    {
      id: "sharing",
      title: "Sharing and disclosure",
      paragraphs: [
        "We do not sell your personal information. We may share limited data with trusted service providers who help us host the website, send email, analyze traffic, or process forms — only as needed to perform those services.",
        "We may disclose information if required by law, to enforce our terms, or to protect the safety of our readers, staff, or the public.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies & analytics",
      paragraphs: [
        "Cookies help us understand which stories resonate and keep the site working smoothly. You can control cookies through your browser settings. Disabling cookies may affect some features.",
      ],
    },
    {
      id: "your-choices",
      title: "Your choices",
      paragraphs: [
        "You may unsubscribe from marketing emails at any time using the link in those messages. To request access, correction, or deletion of personal information you have shared with us, contact our team using the details below.",
      ],
    },
    {
      id: "security",
      title: "Security",
      paragraphs: [
        "We use reasonable administrative and technical safeguards to protect information. No method of transmission over the internet is completely secure; please use unique passwords and report suspected misuse promptly.",
      ],
    },
    {
      id: "contact-privacy",
      title: "Contact",
      paragraphs: [
        "Questions about this Privacy Policy may be sent to privacy@ennnews.com or through our Contact page. We will review and respond as promptly as practical.",
      ],
    },
  ],
};

export const termsPage: LegalPageData = {
  slug: "terms",
  eyebrow: "Using the ENN website",
  title: "Terms of Use",
  deck: "The rules that govern access to Education News Network content, services, and community features — written clearly for readers, partners, and contributors.",
  updated: "July 14, 2026",
  sections: [
    {
      id: "acceptance",
      title: "Acceptance of terms",
      paragraphs: [
        "These Terms of Use apply to your use of the Education News Network website and related digital services. By accessing or using the site, you agree to these terms and our Privacy Policy.",
      ],
    },
    {
      id: "content",
      title: "Editorial content",
      paragraphs: [
        "ENN publishes news, analysis, multimedia, and event materials for informational purposes. Content is protected by copyright and other intellectual property laws. You may share links and quote short excerpts with attribution for personal, non-commercial use.",
        "Unauthorized scraping, bulk downloading, redistribution, or commercial reuse of our content without written permission is prohibited.",
      ],
    },
    {
      id: "accounts",
      title: "Accounts & admin access",
      paragraphs: [
        "Some areas of the site (including admin tools) are restricted to authorized users. You are responsible for safeguarding any credentials issued to you and for activity that occurs under your account.",
      ],
    },
    {
      id: "user-submissions",
      title: "Tips & user submissions",
      paragraphs: [
        "When you send tips, comments, press materials, or other submissions, you grant ENN a non-exclusive license to review, edit, and — where appropriate — publish or use that material in connection with our journalism and programs, consistent with our Ethics Policy.",
        "Do not submit unlawful, defamatory, or confidential third-party information you do not have the right to share.",
      ],
    },
    {
      id: "third-party",
      title: "Third-party links & partners",
      paragraphs: [
        "Our site may include partner advertisements and links to external platforms such as My School Admission (MSA) or social networks. Those sites have their own terms and privacy practices. ENN is not responsible for third-party content or services.",
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      paragraphs: [
        "Content is provided “as is.” While we strive for accuracy, ENN does not warrant that the site will be uninterrupted, error-free, or free of harmful components. Educational and policy reporting is not legal, medical, or financial advice.",
      ],
    },
    {
      id: "limitation",
      title: "Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, ENN and its affiliates shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the site or reliance on any content.",
      ],
    },
    {
      id: "changes-terms",
      title: "Changes to these terms",
      paragraphs: [
        "We may update these Terms of Use from time to time. The “Last updated” date at the top of this page will reflect the latest revision. Continued use of the site after changes means you accept the revised terms.",
      ],
    },
    {
      id: "contact-terms",
      title: "Contact",
      paragraphs: [
        "For licensing, takedown requests, or questions about these terms, contact legal@ennnews.com or use our Contact page.",
      ],
    },
  ],
};

export const ethicsPage: LegalPageData = {
  slug: "ethics",
  eyebrow: "How we practice journalism",
  title: "Ethics Policy",
  deck: "Our commitment to independence, fairness, accuracy, and accountability — the standards that guide every ENN story, panel, and partnership.",
  updated: "July 14, 2026",
  sections: [
    {
      id: "mission",
      title: "Our mission",
      paragraphs: [
        "Education News Network exists to inform the public about education with independent, rigorous journalism. We serve readers first — not advertisers, sponsors, or political interests.",
      ],
    },
    {
      id: "independence",
      title: "Independence & conflicts",
      paragraphs: [
        "Editorial decisions are made by journalists, not by sales or sponsorship teams. We disclose material conflicts of interest. Staff avoid assignments where personal, financial, or family relationships could reasonably undermine trust.",
        "Partner advertisements and sponsored placements are clearly labeled. Sponsored content never dictates news coverage.",
      ],
    },
    {
      id: "accuracy",
      title: "Accuracy & sourcing",
      paragraphs: [
        "We verify information before publication, prefer named sources, and seek comment from parties central to a story. Anonymous sources are used sparingly and only when information is important, unavailable on the record, and reliably vetted.",
      ],
    },
    {
      id: "fairness",
      title: "Fairness & harm",
      paragraphs: [
        "We strive to be fair to people and institutions we cover. We avoid stereotyping, sensational language, and unnecessary identifying details that could place vulnerable individuals — especially minors — at risk.",
      ],
    },
    {
      id: "corrections",
      title: "Corrections & transparency",
      paragraphs: [
        "When we get something wrong, we correct it promptly and clearly. Significant corrections are noted on the relevant article or page. Readers may flag potential errors through our Contact page.",
      ],
    },
    {
      id: "ai-policy",
      title: "Use of AI & technology",
      paragraphs: [
        "Tools that assist drafting, transcription, or research may be used as support, never as a substitute for editorial judgment. Published journalism is reviewed by people who remain accountable for accuracy and tone.",
      ],
    },
    {
      id: "events-partners",
      title: "Events, speakers & sponsors",
      paragraphs: [
        "ENN events bring education leaders together for public dialogue. Sponsors help make programs possible; they do not control speaker lineups or editorial framing. Speakers are invited for expertise and perspective, not as advertisements.",
      ],
    },
    {
      id: "conduct",
      title: "Professional conduct",
      paragraphs: [
        "ENN staff treat sources, audiences, and colleagues with respect. Harassment, plagiarism, fabrication, and undisclosed conflicts are grounds for disciplinary action, up to and including dismissal.",
      ],
    },
    {
      id: "contact-ethics",
      title: "Questions & concerns",
      paragraphs: [
        "Ethics concerns may be directed to ethics@ennnews.com. We take good-faith complaints seriously and review them under this policy.",
      ],
    },
  ],
};

export function getLegalPage(slug: LegalPageData["slug"]): LegalPageData {
  switch (slug) {
    case "privacy":
      return privacyPage;
    case "terms":
      return termsPage;
    case "ethics":
      return ethicsPage;
  }
}
