import { getCollection } from "astro:content";

interface AiContext {
  context: string;
}

export const GET = async (): Promise<Response> => {
  const experienceEntries = await getCollection(`experience`);
  const projectEntries = await getCollection(`projects`);
  const companyEntries = await getCollection(`companies`);

  let context = `## Experience

`;

  // Process Experience
  for (const entry of experienceEntries) {
    const company = companyEntries.find((c) => c.id === entry.data.company.id);
    context += `### ${entry.data.role} at ${company?.data.name || `a company`}
`;
    context += `*${entry.data.startDate.getFullYear()} - ${entry.data.endDate ? entry.data.endDate.getFullYear() : `Present`}*
`;
    context += `${entry.body}

`;
  }

  context += `## Projects

`;

  // Process Projects
  for (const entry of projectEntries) {
    context += `### ${entry.data.title}
`;
    context += `*${entry.data.subtitle}*
`;
    if (entry.data.role) {
      context += `**Role:** ${entry.data.role}
`;
    }
    context += `${entry.body}

`;
  }

  context += `## Companies

`;
  // Process Companies
  for (const entry of companyEntries) {
    context += `### ${entry.data.name}
`;
    if (entry.data.description) {
      context += `${entry.data.description}
`;
    }
    if (entry.data.fullDescription) {
      context += `${entry.data.fullDescription}
`;
    }
    context += `
`;
  }

  const response: AiContext = { context };

  const headers = { "Content-Type": "application/json" };

  return new Response(JSON.stringify(response), { headers });
};
