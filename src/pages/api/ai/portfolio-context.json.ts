import { getCollection, getEntry } from 'astro:content';
import type { APIRoute } from 'astro';

/**
 * API Endpoint: Portfolio Context
 * Generates a rich, structured JSON representation of the entire portfolio.
 * This serves as the "Knowledge Graph" for the local RAG AI.
 */

export const GET: APIRoute = async () => {
  const documents: Array<{ id: string; type: string; title: string; content: string; tags?: string[] }> = [];

  // --- 1. Profile / Biography (People) ---
  const people = await getCollection('people');
  const me = people.find(p => p.id.includes('stevan'));

  if (me) {
    const locationEntry = me.data.location ? await getEntry(me.data.location) : null;
    const locationStr = locationEntry ? `${locationEntry.data.name}, ${locationEntry.data.country}` : 'Belgrade, Serbia';

    // Construct a rich bio
    const bioContent = [
      `I am ${me.data.firstName} ${me.data.lastName}, a ${me.data.title}.`,
      me.data.description,
      `I am currently based in ${locationStr}.`,
      `My core expertise lies in software engineering, architecture, and technical leadership.`,
      `You can find me on ${me.data.socialLinks?.map(l => l.type).join(', ') || 'various platforms'}.`
    ].filter(Boolean).join(' ');

    documents.push({
      id: 'profile-bio',
      type: 'profile',
      title: `About ${me.data.firstName}`,
      content: bioContent,
      tags: ['bio', 'personal', 'contact']
    });
  }

  // --- 2. Professional Experience ---
  const experience = await getCollection('experience');
  // Sort by date descending for relevance
  experience.sort((a, b) => b.data.startDate.valueOf() - a.data.startDate.valueOf());

  for (const job of experience) {
    const company = await getEntry(job.data.company);
    const companyName = company?.data.name || job.data.company.id;

    // Format dates
    const start = job.data.startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const end = job.data.endDate ? job.data.endDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Present';

    // Resolve tags/tech stack
    const techStack = job.data.tags
      ? (await Promise.all(job.data.tags.map(t => getEntry(t)))).map(t => t?.data.label).filter(Boolean).join(', ')
      : '';

    const content = [
      `I worked as a ${job.data.role} at ${companyName} from ${start} to ${end}.`,
      `Role description: ${job.data.description}`,
      techStack ? `Technologies and skills used in this role included: ${techStack}.` : '',
      company?.data.description ? `About ${companyName}: ${company.data.description}` : '',
      company?.data.industry ? `Industry: ${company.data.industry}` : '',
      company?.data.size ? `Company Size: ${company.data.size}` : ''
    ].filter(Boolean).join(' ');

    documents.push({
      id: `exp-${job.id}`,
      type: 'experience',
      title: `${job.data.role} at ${companyName}`,
      content: content,
      tags: ['experience', 'career', 'job', companyName]
    });
  }

  // --- 3. Projects & Case Studies ---
  const projects = await getCollection('projects');

  for (const project of projects) {
    // Resolve tags
    const tags = await Promise.all(project.data.tags.map(t => getEntry(t)));
    const tagLabels = tags.map(t => t?.data.label).filter(Boolean);
    const tagContext = tagLabels.join(', ');

    const content = [
      `Project Name: ${project.data.title}.`,
      `Overview: ${project.data.description}`,
      project.data.impact ? `Impact: ${project.data.impact}` : '',
      project.data.challenges?.length ? `Key challenges solved: ${project.data.challenges.join('. ')}.` : '',
      `Technical Stack: ${tagContext}.`,
      project.data.demoUrl ? `Live Demo available at: ${project.data.demoUrl}` : '',
      project.data.repoUrl ? `Source Code available at: ${project.data.repoUrl}` : '',
      project.data.role ? `My Role: ${project.data.role}` : '',
      project.data.teamSize ? `Team Size: ${project.data.teamSize}` : ''
    ].filter(Boolean).join(' ');

    documents.push({
      id: `project-${project.id}`,
      type: 'project',
      title: project.data.title,
      content: content,
      tags: ['project', 'portfolio', ...tagLabels]
    });
  }

  // --- 4. Technical Blog Posts ---
  const blog = await getCollection('blog');

  for (const post of blog) {
    // Resolve tags
    const tags = await Promise.all(post.data.tags.map(t => getEntry(t)));
    const tagLabels = tags.map(t => t?.data.label).filter(Boolean);

    // Note: We are using description instead of full body to keep context size manageable for local LLM
    const content = [
      `Article Title: "${post.data.title}"`,
      `Summary: ${post.data.description}`,
      `Published on: ${post.data.pubDate.toLocaleDateString('en-US', { dateStyle: 'long' })}.`,
      `Topics covered: ${tagLabels.join(', ')}.`
    ].join(' ');

    documents.push({
      id: `blog-${post.id}`,
      type: 'blog',
      title: post.data.title,
      content: content,
      tags: ['blog', 'article', 'writing', ...tagLabels]
    });
  }

  // --- 5. Recommendations ---
  const recommendations = await getCollection('recommendations');

  for (const rec of recommendations) {
    const author = rec.data.name;
    const relation = rec.data.relationship || 'Colleague';
    const content = `Received a recommendation from ${author} (${relation}): "${rec.data.title}". Context: ${rec.data.context || 'Professional collaboration'}.`;

    documents.push({
      id: `rec-${rec.id}`,
      type: 'recommendation',
      title: `Recommendation from ${author}`,
      content: content,
      tags: ['recommendation', 'testimonial', relation]
    });
  }

  // --- 6. Companies (Detailed Context) ---
  const companies = await getCollection('companies');

  for (const company of companies) {
    // Only index companies that have descriptions to avoid noise
    if (company.data.description) {
        documents.push({
            id: `company-${company.id}`,
            type: 'company',
            title: company.data.name,
            content: `${company.data.name} is a ${company.data.size || ''} company in the ${company.data.industry || 'Tech'} industry. ${company.data.description}`,
            tags: ['company', company.data.industry || 'tech']
        });
    }
  }

  // --- 7. Skills & Expertise (Aggregated via Tags & Categories) ---
  const allTags = await getCollection('tags');

  // Group skills by category for better context
  const skillsByCategory = new Map<string, string[]>();

  for (const tag of allTags) {
    const category = await getEntry(tag.data.category);
    const catLabel = category?.data.label || 'Other';

    if (!skillsByCategory.has(catLabel)) {
      skillsByCategory.set(catLabel, []);
    }
    // Add description if available to enrich context
    const desc = tag.data.description ? ` (${tag.data.description})` : '';
    skillsByCategory.get(catLabel)?.push(`${tag.data.label}${desc}`);
  }

  const skillsContent = Array.from(skillsByCategory.entries())
    .map(([cat, skills]) => `${cat}: ${skills.join(', ')}`)
    .join('. ');

  documents.push({
    id: 'skills-summary',
    type: 'skills',
    title: 'Technical Skills & Expertise',
    content: `My technical skill set includes: ${skillsContent}.`,
    tags: ['skills', 'stack', 'technologies']
  });

  return new Response(JSON.stringify(documents), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Aggressive caching: 1 hour CDN, 1 day stale-while-revalidate
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    }
  });
};
