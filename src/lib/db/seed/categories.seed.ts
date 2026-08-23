import type { DataSource } from "typeorm";
import { Category } from "../entities/category.entity";

export const CATEGORY_SEED: Array<{ slug: string; name: string }> = [
  { slug: "seo-ai-visibility", name: "SEO & AI Visibility" },
  { slug: "ai-agents-infrastructure", name: "AI Agents & Infrastructure" },
  { slug: "ai-media-generation", name: "AI Media Generation" },
  { slug: "marketing-advertising", name: "Marketing & Advertising" },
  { slug: "developer-tools", name: "Developer Tools" },
  { slug: "productivity-personal-tools", name: "Productivity & Personal Tools" },
  { slug: "people-profiles", name: "People & Profiles" },
  { slug: "design-creative", name: "Design & Creative" },
  { slug: "social-media-creator-tools", name: "Social Media & Creator Tools" },
  { slug: "writing-content", name: "Writing & Content" },
  { slug: "sales-lead-generation", name: "Sales & Lead Generation" },
  { slug: "business-finance-legal", name: "Business, Finance & Legal" },
  { slug: "games-entertainment", name: "Games & Entertainment" },
  { slug: "education-learning", name: "Education & Learning" },
  { slug: "health-fitness-wellness", name: "Health, Fitness & Wellness" },
  { slug: "ecommerce-retail", name: "Ecommerce & Retail" },
  { slug: "directories-launch-discovery", name: "Directories, Launch & Discovery" },
  { slug: "hiring-jobs-careers", name: "Hiring, Jobs & Careers" },
  { slug: "audio-voice-podcasting", name: "Audio, Voice & Podcasting" },
  { slug: "crypto-web3-investing", name: "Crypto, Web3 & Investing" },
  { slug: "agencies-studios-services", name: "Agencies, Studios & Services" },
  { slug: "security-privacy-compliance", name: "Security, Privacy & Compliance" },
  { slug: "travel-local-lifestyle", name: "Travel, Local & Lifestyle" },
  { slug: "media-news", name: "Media & News" },
  { slug: "domains-web-assets", name: "Domains & Web Assets" },
  { slug: "leaderboards-attention-markets", name: "Leaderboards & Attention Markets" },
  { slug: "real-estate-property", name: "Real Estate & Property" },
  { slug: "other", name: "Other" },
];

export async function ensureCategoriesSeeded(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Category);

  for (let i = 0; i < CATEGORY_SEED.length; i++) {
    const { slug, name } = CATEGORY_SEED[i];
    const existing = await repo.findOne({ where: { slug } });
    if (existing) {
      if (existing.name !== name || existing.sortOrder !== i) {
        existing.name = name;
        existing.sortOrder = i;
        await repo.save(existing);
      }
      continue;
    }
    await repo.save(repo.create({ slug, name, sortOrder: i }));
  }
}
