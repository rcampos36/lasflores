import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectPage } from "@/components/project-page";
import { getSiteContent } from "@/lib/content";
import { projectPath } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function matchProject(
  projects: Awaited<ReturnType<typeof getSiteContent>>["projects"],
  slug: string,
) {
  return projects.find((project) => {
    const path = projectPath(project);
    return path === `/proyectos/${slug}` || project.slug === slug;
  });
}

export async function generateStaticParams() {
  const content = await getSiteContent();
  return content.projects.map((project) => ({
    slug: project.slug || projectPath(project).replace("/proyectos/", ""),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getSiteContent();
  const project = matchProject(content.projects, slug);
  if (!project) return { title: content.brand.title };

  return {
    title: `${project.title} · ${content.brand.title}`,
    description: project.imageAlt || content.brand.description,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getSiteContent();
  const project = matchProject(content.projects, slug);
  if (!project) notFound();

  return <ProjectPage content={content} project={project} />;
}
