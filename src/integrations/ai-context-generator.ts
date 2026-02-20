
import { defineIntegration } from 'astro-integration-kit';
import { getCollection } from 'astro:content';
import fs from 'node:fs/promises';
import path from 'node:path';

// This integration will generate a static JSON file at build time
// containing aggregated content for the AI chatbot.
const aiContextGenerator = defineIntegration({
    name: 'ai-context-generator',
    setup() {
        return {
            'astro:build:done': async ({ dir }) => {
                console.log('Generating AI context JSON...');

                const experienceEntries = await getCollection('experience');
                const projectEntries = await getCollection('projects');
                const companyEntries = await getCollection('companies');

                let context = '## Experience

';

                // Process Experience
                for (const entry of experienceEntries) {
                    const company = companyEntries.find(c => c.id === entry.data.company.id);
                    context += `### ${entry.data.role} at ${company?.data.name || 'a company'}
`;
                    context += `*${entry.data.startDate.getFullYear()} - ${entry.data.endDate ? entry.data.endDate.getFullYear() : 'Present'}*
`;
                    context += `${entry.body}

`;
                }

                context += '## Projects

';

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

                context += '## Companies

';
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
                    context += '
';
                }

                const output = { context };
                const outputPath = path.join(dir.pathname, 'ai-context.json');

                try {
                    await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');
                    console.log(`Successfully generated AI context to ${outputPath}`);
                } catch (error) {
                    console.error('Error generating AI context JSON:', error);
                }
            },
        };
    },
});

export default aiContextGenerator;
