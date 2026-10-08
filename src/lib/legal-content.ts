// DRAFT CONTENT — generic placeholder structure only. Not reviewed by counsel.
// Shared by the /terms and /privacy pages and the billing checkout modal so
// the text only lives in one place.
export type LegalSection = { heading: string; body: string[] };

export const termsSections: LegalSection[] = [
  {
    heading: "Acceptance of Terms",
    body: [
      "By creating an account or using Church Workflow, you agree to these Terms of Service. If you do not agree, do not use the service.",
    ],
  },
  {
    heading: "Description of Service",
    body: [
      "Church Workflow is a church management platform providing membership management, attendance tracking, team/department administration, and related tools, offered on free and paid subscription plans.",
    ],
  },
  {
    heading: "Accounts",
    body: [
      "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.",
      "You must provide accurate information when creating an account and keep it up to date.",
    ],
  },
  {
    heading: "Subscriptions and Billing",
    body: [
      "Paid plans are billed on the cycle you select (monthly or yearly) at the price displayed at checkout.",
      "Payments are processed by third-party providers (Paystack, Flutterwave). By subscribing, you authorize us to charge your chosen payment method on a recurring basis until you cancel.",
      "Fees are non-refundable except where required by law or explicitly stated otherwise.",
    ],
  },
  {
    heading: "Free Plan Limits",
    body: [
      "The free Starter plan is subject to usage limits (such as member and user counts) as described on our pricing page. Exceeding these limits may require upgrading to a paid plan to continue full functionality.",
    ],
  },
  {
    heading: "Acceptable Use",
    body: [
      "You agree not to use Church Workflow for unlawful purposes, to upload data you do not have the right to store, or to attempt to disrupt or compromise the service.",
    ],
  },
  {
    heading: "Termination",
    body: [
      "You may cancel your account at any time. We may suspend or terminate accounts that violate these terms.",
    ],
  },
  {
    heading: "Limitation of Liability",
    body: [
      'Church Workflow is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from use of the service.',
    ],
  },
  {
    heading: "Changes to These Terms",
    body: [
      "We may update these terms from time to time. Continued use of the service after changes take effect constitutes acceptance of the updated terms.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about these terms can be directed to our support team through the contact channels listed on our website.",
    ],
  },
];

export const privacySections: LegalSection[] = [
  {
    heading: "Information We Collect",
    body: [
      "Account information you provide when you sign up, such as your name, email address, phone number, and church details.",
      "Member and operational data you or your team enter into Church Workflow, such as membership records, attendance, and department/team information.",
      "Usage data collected automatically, such as pages visited and features used, via analytics tools (Google Analytics, Mixpanel).",
      "Payment information processed by our payment providers (Paystack, Flutterwave) — we do not store your card details ourselves.",
    ],
  },
  {
    heading: "How We Use Information",
    body: [
      "To provide, maintain, and improve the Church Workflow service.",
      "To communicate with you about your account, updates, and support requests.",
      "To process payments and manage subscriptions.",
      "To understand product usage and improve the product experience.",
    ],
  },
  {
    heading: "Data Sharing",
    body: [
      "We do not sell your personal data.",
      "We share data with service providers who help us operate the platform (e.g. hosting, email delivery, payment processing, analytics), under agreements that require them to protect your data.",
      "We may disclose information if required by law.",
    ],
  },
  {
    heading: "Data Retention",
    body: [
      "We retain account and member data for as long as your account is active, and for a reasonable period afterward as required for legal, accounting, or legitimate business purposes.",
    ],
  },
  {
    heading: "Your Rights",
    body: [
      "You may request access to, correction of, or deletion of your personal data by contacting us.",
      "You may opt out of non-essential analytics tracking where technically supported.",
    ],
  },
  {
    heading: "Changes to This Policy",
    body: [
      "We may update this policy from time to time. Material changes will be communicated to registered users.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about this policy can be directed to our support team through the contact channels listed on our website.",
    ],
  },
];
