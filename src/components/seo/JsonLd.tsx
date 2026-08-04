import { BASE_URL, SITE_NAME } from "@/lib/seo";

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/assets/logo/horizontal/main.png`,
    description:
      "Church Workflow is a church administration software for managing members, communication, finance, and operations efficiently.",
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: BASE_URL,
    description:
      "All-in-one church management software for member tracking, attendance, finance, and ministry operations.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "NGN",
      description: "Free starter plan available",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Church Workflow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Church Workflow is an all-in-one church management software designed to help churches manage members, attendance, finance, tasks, and communication from a single platform.",
        },
      },
      {
        "@type": "Question",
        name: "Is Church Workflow available in Nigeria?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Church Workflow is built specifically for the Nigerian church context, with Naira pricing and local support.",
        },
      },
      {
        "@type": "Question",
        name: "Does Church Workflow have a free plan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The Starter plan is free and supports up to 3 users and 100 members with core features like member management and attendance tracking.",
        },
      },
      {
        "@type": "Question",
        name: "Can Church Workflow handle multiple branches?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Church Workflow is multi-branch ready, allowing large churches to manage multiple locations under one unified system.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
