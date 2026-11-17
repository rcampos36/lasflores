"use client";

import { useRef, useState, useTransition } from "react";
import type { Project, SiteContent } from "@/lib/content";

type ContentEditorProps = {
  initialContent: SiteContent;
};

const PROJECT_COLORS = ["#bfcbd9", "#b692a0", "#798e7b", "#c5cdd0", "#e19269"];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs tracking-[0.14em] uppercase opacity-55">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-black/40";

const buttonClass =
  "rounded-full border border-black/15 px-4 py-2 text-sm transition-colors hover:bg-black hover:text-white disabled:opacity-50";

function nextProjectId(projects: Project[]) {
  const max = projects.reduce((highest, project) => {
    const value = Number.parseInt(project.id, 10);
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return String(max + 1).padStart(2, "0");
}

function emptyProject(projects: Project[]): Project {
  const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
  return {
    id: nextProjectId(projects),
    title: "New project",
    year: String(new Date().getFullYear()),
    tags: ["Category", "Short description"],
    image: null,
    imageAlt: "",
    color,
    media: color,
  };
}

export function ContentEditor({ initialContent }: ContentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});

  function updateBrand<K extends keyof SiteContent["brand"]>(
    key: K,
    value: SiteContent["brand"][K],
  ) {
    setContent((current) => ({
      ...current,
      brand: { ...current.brand, [key]: value },
    }));
  }

  function updateMenu(
    index: number,
    key: keyof SiteContent["menu"][number],
    value: string,
  ) {
    setContent((current) => ({
      ...current,
      menu: current.menu.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function addMenuItem() {
    setContent((current) => ({
      ...current,
      menu: [
        ...current.menu,
        { href: "#", label: "New link", color: "#c5cdd0" },
      ],
    }));
  }

  function removeMenuItem(index: number) {
    setContent((current) => ({
      ...current,
      menu: current.menu.filter((_, i) => i !== index),
    }));
  }

  function updateSocial(
    index: number,
    key: keyof SiteContent["socials"][number],
    value: string,
  ) {
    setContent((current) => ({
      ...current,
      socials: current.socials.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function addSocial() {
    setContent((current) => ({
      ...current,
      socials: [...current.socials, { href: "#", label: "Social" }],
    }));
  }

  function removeSocial(index: number) {
    setContent((current) => ({
      ...current,
      socials: current.socials.filter((_, i) => i !== index),
    }));
  }

  function updateProject(index: number, key: keyof Project, value: string) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((project, i) => {
        if (i !== index) return project;
        if (key === "image") {
          return { ...project, image: value.trim() ? value : null };
        }
        if (key === "tags") {
          return project;
        }
        return { ...project, [key]: value };
      }),
    }));
  }

  function updateProjectTag(index: number, tagIndex: 0 | 1, value: string) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((project, i) => {
        if (i !== index) return project;
        const tags: [string, string] = [...project.tags];
        tags[tagIndex] = value;
        return { ...project, tags };
      }),
    }));
  }

  function addProject() {
    setContent((current) => ({
      ...current,
      projects: [...current.projects, emptyProject(current.projects)],
    }));
  }

  function removeProject(index: number) {
    setContent((current) => ({
      ...current,
      projects: current.projects.filter((_, i) => i !== index),
    }));
  }

  function clearProjectImage(index: number) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((project, i) =>
        i === index ? { ...project, image: null } : project,
      ),
    }));
  }

  async function uploadProjectImage(index: number, file: File) {
    setMessage(null);
    setUploadingIndex(index);

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body,
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setMessage(data.error ?? "Image upload failed.");
        return;
      }

      setContent((current) => ({
        ...current,
        projects: current.projects.map((project, i) =>
          i === index
            ? {
                ...project,
                image: data.url!,
                imageAlt: project.imageAlt || file.name.replace(/\.[^.]+$/, ""),
              }
            : project,
        ),
      }));
      setMessage("Image uploaded. Save changes to keep it on the site.");
    } catch {
      setMessage("Image upload failed.");
    } finally {
      setUploadingIndex(null);
    }
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        setMessage("Could not save. Check the form and try again.");
        return;
      }

      setMessage("Saved. Refresh the homepage to see changes.");
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4 rounded-3xl border border-black/8 bg-white/70 p-5 sm:p-6">
        <h2 className="text-lg tracking-[-0.03em]">Brand</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Logo name">
            <input
              className={inputClass}
              value={content.brand.name}
              onChange={(event) => updateBrand("name", event.target.value)}
            />
          </Field>
          <Field label="Tagline">
            <input
              className={inputClass}
              value={content.brand.tagline}
              onChange={(event) => updateBrand("tagline", event.target.value)}
            />
          </Field>
          <Field label="Browser title">
            <input
              className={inputClass}
              value={content.brand.title}
              onChange={(event) => updateBrand("title", event.target.value)}
            />
          </Field>
          <Field label="Meta description">
            <input
              className={inputClass}
              value={content.brand.description}
              onChange={(event) =>
                updateBrand("description", event.target.value)
              }
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-black/8 bg-white/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg tracking-[-0.03em]">Menu</h2>
          <button type="button" className={buttonClass} onClick={addMenuItem}>
            Add link
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {content.menu.map((item, index) => (
            <div
              key={`menu-${index}`}
              className="grid gap-3 rounded-2xl border border-black/6 p-4 sm:grid-cols-[1fr_1fr_7rem_auto]"
            >
              <Field label="Label">
                <input
                  className={inputClass}
                  value={item.label}
                  onChange={(event) =>
                    updateMenu(index, "label", event.target.value)
                  }
                />
              </Field>
              <Field label="Link">
                <input
                  className={inputClass}
                  value={item.href}
                  onChange={(event) =>
                    updateMenu(index, "href", event.target.value)
                  }
                />
              </Field>
              <Field label="Dot color">
                <input
                  className={`${inputClass} font-mono`}
                  value={item.color}
                  onChange={(event) =>
                    updateMenu(index, "color", event.target.value)
                  }
                />
              </Field>
              <div className="flex items-end">
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => removeMenuItem(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-black/8 bg-white/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg tracking-[-0.03em]">Socials</h2>
          <button type="button" className={buttonClass} onClick={addSocial}>
            Add social
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {content.socials.map((item, index) => (
            <div
              key={`social-${index}`}
              className="grid gap-3 rounded-2xl border border-black/6 p-4 sm:grid-cols-[1fr_1fr_auto]"
            >
              <Field label="Label">
                <input
                  className={inputClass}
                  value={item.label}
                  onChange={(event) =>
                    updateSocial(index, "label", event.target.value)
                  }
                />
              </Field>
              <Field label="URL">
                <input
                  className={inputClass}
                  value={item.href}
                  onChange={(event) =>
                    updateSocial(index, "href", event.target.value)
                  }
                />
              </Field>
              <div className="flex items-end">
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => removeSocial(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-black/8 bg-white/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg tracking-[-0.03em]">Projects</h2>
          <button type="button" className={buttonClass} onClick={addProject}>
            Add project
          </button>
        </div>
        <div className="flex flex-col gap-5">
          {content.projects.map((project, index) => (
            <div
              key={`project-${index}-${project.id}`}
              className="flex flex-col gap-4 rounded-2xl border border-black/6 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="text-sm tracking-[0.12em] uppercase opacity-55">
                  Project {project.id}
                </p>
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => removeProject(index)}
                  disabled={content.projects.length <= 1}
                >
                  Remove
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-black/8 bg-[#e8e6e0]">
                {project.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.image}
                    alt={project.imageAlt || project.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm opacity-50">
                    No image yet
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <input
                  ref={(node) => {
                    fileInputs.current[index] = node;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void uploadProjectImage(index, file);
                  }}
                />
                <button
                  type="button"
                  className={buttonClass}
                  disabled={uploadingIndex === index}
                  onClick={() => fileInputs.current[index]?.click()}
                >
                  {uploadingIndex === index
                    ? "Uploading..."
                    : project.image
                      ? "Replace image"
                      : "Upload image"}
                </button>
                {project.image ? (
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() => clearProjectImage(index)}
                  >
                    Remove image
                  </button>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="ID">
                  <input
                    className={inputClass}
                    value={project.id}
                    onChange={(event) =>
                      updateProject(index, "id", event.target.value)
                    }
                  />
                </Field>
                <Field label="Title">
                  <input
                    className={inputClass}
                    value={project.title}
                    onChange={(event) =>
                      updateProject(index, "title", event.target.value)
                    }
                  />
                </Field>
                <Field label="Year">
                  <input
                    className={inputClass}
                    value={project.year}
                    onChange={(event) =>
                      updateProject(index, "year", event.target.value)
                    }
                  />
                </Field>
                <Field label="Image alt">
                  <input
                    className={inputClass}
                    value={project.imageAlt}
                    onChange={(event) =>
                      updateProject(index, "imageAlt", event.target.value)
                    }
                  />
                </Field>
                <Field label="Panel color">
                  <input
                    className={`${inputClass} font-mono`}
                    value={project.color}
                    onChange={(event) =>
                      updateProject(index, "color", event.target.value)
                    }
                  />
                </Field>
                <Field label="Media color">
                  <input
                    className={`${inputClass} font-mono`}
                    value={project.media}
                    onChange={(event) =>
                      updateProject(index, "media", event.target.value)
                    }
                  />
                </Field>
                <Field label="Tag 1">
                  <input
                    className={inputClass}
                    value={project.tags[0]}
                    onChange={(event) =>
                      updateProjectTag(index, 0, event.target.value)
                    }
                  />
                </Field>
                <Field label="Tag 2">
                  <textarea
                    className={`${inputClass} min-h-20 resize-y`}
                    value={project.tags[1]}
                    onChange={(event) =>
                      updateProjectTag(index, 1, event.target.value)
                    }
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-[#f0efeb]/95 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={pending || uploadingIndex !== null}
          className="rounded-full bg-[#161616] px-5 py-2.5 text-sm text-white transition-opacity disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
        {message ? <p className="text-sm opacity-70">{message}</p> : null}
      </div>
    </div>
  );
}
