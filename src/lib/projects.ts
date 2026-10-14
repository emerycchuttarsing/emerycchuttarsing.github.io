import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { SceneProject } from '../scene/types';

export type Project = CollectionEntry<'projects'>;

export function projectPath(id: string): string {
  return `/projects/${id}/`;
}

export async function getProjects(): Promise<Project[]> {
  const projects = (await getCollection('projects')).sort(
    (a, b) => a.data.order - b.data.order,
  );
  // The first release has a fixed editorial scope, documented in BRIEF_AGENT_CODEUR.md.
  if (
    projects.length !== 7 ||
    projects.filter((project) => project.data.featured).length !== 3
  ) {
    throw new Error(
      'The portfolio must contain seven projects, including three featured projects.',
    );
  }
  const ids = new Set<string>();
  for (const [index, project] of projects.entries()) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id) || ids.has(project.id)) {
      throw new Error(`Invalid or duplicate project identifier: ${project.id}`);
    }
    ids.add(project.id);
    if (
      project.data.order !== index + 1 ||
      project.data.featured !== index < 3
    ) {
      throw new Error(
        `Project order must be 1–7, with the three featured projects first: ${project.id}`,
      );
    }
    if (!project.body?.trim()) {
      throw new Error(`Project body is empty: ${project.id}`);
    }
    for (const media of [
      project.data.poster.src,
      project.data.scenePoster,
      project.data.video,
    ].filter((value) => value !== undefined)) {
      const asset = await stat(resolve('public', media.slice(1))).catch(
        () => null,
      );
      if (!asset?.isFile())
        throw new Error(`Missing media for ${project.id}: ${media}`);
    }
  }
  return projects;
}

// A small serializable view for the browser; Markdown and filesystem checks stay at build time.
export function toSceneProject(project: Project): SceneProject {
  return {
    id: project.id,
    href: projectPath(project.id),
    title: project.data.title,
    summary: project.data.summary,
    featured: project.data.featured,
    poster: {
      ...project.data.poster,
      src: project.data.scenePoster ?? project.data.poster.src,
    },
    accent: project.data.accent,
    ...(project.data.video ? { video: project.data.video } : {}),
  };
}
