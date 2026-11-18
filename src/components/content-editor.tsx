"use client";

import { useRef, useState, useTransition } from "react";
import type {
  ClosingContent,
  ExpertiseItem,
  ExpertisesContent,
  Project,
  SiteContent,
} from "@/lib/content";

type ContentEditorProps = {
  initialContent: SiteContent;
};

const PROJECT_COLORS = ["#bfcbd9", "#b692a0", "#798e7b", "#c5cdd0", "#e19269"];
const EXPERTISE_COLORS = [
  "#c5cdd0",
  "#b1939d",
  "#7d877c",
  "#bfcbd9",
  "#e19269",
];

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
    title: "Nuevo proyecto",
    year: String(new Date().getFullYear()),
    tags: ["Categoría", "Descripción breve"],
    tagsEn: ["Category", "Short description"],
    image: null,
    imageAlt: "",
    imageAltEn: "",
    color,
    media: color,
  };
}

function emptyExpertise(items: ExpertiseItem[]): ExpertiseItem {
  const color = EXPERTISE_COLORS[items.length % EXPERTISE_COLORS.length];
  return {
    id: String(items.length + 1).padStart(2, "0"),
    title: "Nueva especialidad",
    titleEn: "New expertise",
    services: ["Servicio 1", "Servicio 2"],
    servicesEn: ["Service 1", "Service 2"],
    color,
    image: null,
    imageAlt: "",
    imageAltEn: "",
  };
}

function defaultExpertises(): ExpertisesContent {
  return {
    title: "Especialidades",
    titleEn: "Expertises",
    cta: "Ver la especialidad",
    ctaEn: "See the expertise",
    items: [emptyExpertise([])],
  };
}

function defaultClosing(): ClosingContent {
  return {
    headline: "Te retamos\na que\nnos retes.",
    headlineEn: "We challenge you\nto\nchallenge us.",
    cta: "Contáctanos",
    ctaEn: "Contact us",
    ctaHref: "mailto:hola@lasflores.studio",
    address: ["Las Flores", "Ciudad", "País"],
    emails: ["hola@lasflores.studio"],
    phone: "",
    legal: "Aviso legal",
    legalEn: "Legal notice",
    legalHref: "#",
    copyright: "Las Flores© 2026",
  };
}

function linesToList(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ContentEditor({ initialContent }: ContentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const expertises = content.expertises ?? defaultExpertises();
  const closing = content.closing ?? defaultClosing();

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
        {
          href: "#",
          label: "Nuevo enlace",
          labelEn: "New link",
          color: "#c5cdd0",
        },
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

  function updateListing<K extends keyof SiteContent["listing"]>(
    key: K,
    value: SiteContent["listing"][K],
  ) {
    setContent((current) => ({
      ...current,
      listing: { ...current.listing, [key]: value },
    }));
  }

  function updateListingItem(
    index: number,
    key: keyof SiteContent["listing"]["items"][number],
    value: string,
  ) {
    setContent((current) => ({
      ...current,
      listing: {
        ...current.listing,
        items: current.listing.items.map((item, i) =>
          i === index ? { ...item, [key]: value } : item,
        ),
      },
    }));
  }

  function addListingItem() {
    setContent((current) => ({
      ...current,
      listing: {
        ...current.listing,
        items: [
          ...current.listing.items,
          {
            id: String(current.listing.items.length).padStart(2, "0"),
            label: "Nueva especialidad",
            labelEn: "New expertise",
          },
        ],
      },
    }));
  }

  function removeListingItem(index: number) {
    setContent((current) => ({
      ...current,
      listing: {
        ...current.listing,
        items: current.listing.items.filter((_, i) => i !== index),
      },
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

  function updateProjectTag(
    index: number,
    tagIndex: 0 | 1,
    value: string,
    locale: "es" | "en" = "es",
  ) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((project, i) => {
        if (i !== index) return project;
        if (locale === "en") {
          const tagsEn: [string, string] = [...project.tagsEn];
          tagsEn[tagIndex] = value;
          return { ...project, tagsEn };
        }
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

  function ensureExpertises(
    current: SiteContent,
    next: ExpertisesContent,
  ): SiteContent {
    return { ...current, expertises: next };
  }

  function updateExpertisesMeta<K extends keyof ExpertisesContent>(
    key: K,
    value: ExpertisesContent[K],
  ) {
    setContent((current) =>
      ensureExpertises(current, {
        ...(current.expertises ?? defaultExpertises()),
        [key]: value,
      }),
    );
  }

  function updateExpertiseItem(
    index: number,
    key: keyof ExpertiseItem,
    value: string | string[] | null,
  ) {
    setContent((current) => {
      const base = current.expertises ?? defaultExpertises();
      return ensureExpertises(current, {
        ...base,
        items: base.items.map((item, i) =>
          i === index ? { ...item, [key]: value } : item,
        ),
      });
    });
  }

  function addExpertiseItem() {
    setContent((current) => {
      const base = current.expertises ?? defaultExpertises();
      return ensureExpertises(current, {
        ...base,
        items: [...base.items, emptyExpertise(base.items)],
      });
    });
  }

  function removeExpertiseItem(index: number) {
    setContent((current) => {
      const base = current.expertises ?? defaultExpertises();
      if (base.items.length <= 1) return current;
      return ensureExpertises(current, {
        ...base,
        items: base.items.filter((_, i) => i !== index),
      });
    });
  }

  function clearExpertiseImage(index: number) {
    updateExpertiseItem(index, "image", null);
  }

  function updateClosing<K extends keyof ClosingContent>(
    key: K,
    value: ClosingContent[K],
  ) {
    setContent((current) => ({
      ...current,
      closing: { ...(current.closing ?? defaultClosing()), [key]: value },
    }));
  }

  async function uploadImage(
    key: string,
    file: File,
    applyUrl: (url: string) => void,
  ) {
    setMessage(null);
    setUploadingKey(key);

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

      applyUrl(data.url);
      setMessage("Image uploaded. Save changes to keep it on the site.");
    } catch {
      setMessage("Image upload failed.");
    } finally {
      setUploadingKey(null);
    }
  }

  async function uploadProjectImage(index: number, file: File) {
    await uploadImage(`project-${index}`, file, (url) => {
      setContent((current) => ({
        ...current,
        projects: current.projects.map((project, i) =>
          i === index
            ? {
                ...project,
                image: url,
                imageAlt: project.imageAlt || file.name.replace(/\.[^.]+$/, ""),
              }
            : project,
        ),
      }));
    });
  }

  async function uploadExpertiseImage(index: number, file: File) {
    await uploadImage(`expertise-${index}`, file, (url) => {
      setContent((current) => {
        const base = current.expertises ?? defaultExpertises();
        return ensureExpertises(current, {
          ...base,
          items: base.items.map((item, i) =>
            i === index
              ? {
                  ...item,
                  image: url,
                  imageAlt: item.imageAlt || file.name.replace(/\.[^.]+$/, ""),
                }
              : item,
          ),
        });
      });
    });
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
              className="grid gap-3 rounded-2xl border border-black/6 p-4 sm:grid-cols-[1fr_1fr_1fr_7rem_auto]"
            >
              <Field label="Label (ES)">
                <input
                  className={inputClass}
                  value={item.label}
                  onChange={(event) =>
                    updateMenu(index, "label", event.target.value)
                  }
                />
              </Field>
              <Field label="Label (EN)">
                <input
                  className={inputClass}
                  value={item.labelEn}
                  onChange={(event) =>
                    updateMenu(index, "labelEn", event.target.value)
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
          <h2 className="text-lg tracking-[-0.03em]">Projects listing</h2>
          <button type="button" className={buttonClass} onClick={addListingItem}>
            Add row
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title (ES)">
            <input
              className={inputClass}
              value={content.listing.title}
              onChange={(event) => updateListing("title", event.target.value)}
            />
          </Field>
          <Field label="Title (EN)">
            <input
              className={inputClass}
              value={content.listing.titleEn}
              onChange={(event) => updateListing("titleEn", event.target.value)}
            />
          </Field>
          <Field label="Blurb (ES)">
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              value={content.listing.blurb}
              onChange={(event) => updateListing("blurb", event.target.value)}
            />
          </Field>
          <Field label="Blurb (EN)">
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              value={content.listing.blurbEn}
              onChange={(event) => updateListing("blurbEn", event.target.value)}
            />
          </Field>
        </div>
        <div className="flex flex-col gap-4">
          {content.listing.items.map((item, index) => (
            <div
              key={`listing-${index}`}
              className="grid gap-3 rounded-2xl border border-black/6 p-4 sm:grid-cols-[5rem_1fr_1fr_auto]"
            >
              <Field label="ID">
                <input
                  className={inputClass}
                  value={item.id}
                  onChange={(event) =>
                    updateListingItem(index, "id", event.target.value)
                  }
                />
              </Field>
              <Field label="Label (ES)">
                <input
                  className={inputClass}
                  value={item.label}
                  onChange={(event) =>
                    updateListingItem(index, "label", event.target.value)
                  }
                />
              </Field>
              <Field label="Label (EN)">
                <input
                  className={inputClass}
                  value={item.labelEn}
                  onChange={(event) =>
                    updateListingItem(index, "labelEn", event.target.value)
                  }
                />
              </Field>
              <div className="flex items-end">
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => removeListingItem(index)}
                  disabled={content.listing.items.length <= 1}
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
                    fileInputs.current[`project-${index}`] = node;
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
                  disabled={uploadingKey === `project-${index}`}
                  onClick={() =>
                    fileInputs.current[`project-${index}`]?.click()
                  }
                >
                  {uploadingKey === `project-${index}`
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
                <Field label="Image alt (ES)">
                  <input
                    className={inputClass}
                    value={project.imageAlt}
                    onChange={(event) =>
                      updateProject(index, "imageAlt", event.target.value)
                    }
                  />
                </Field>
                <Field label="Image alt (EN)">
                  <input
                    className={inputClass}
                    value={project.imageAltEn}
                    onChange={(event) =>
                      updateProject(index, "imageAltEn", event.target.value)
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
                <Field label="Tag 1 (ES)">
                  <input
                    className={inputClass}
                    value={project.tags[0]}
                    onChange={(event) =>
                      updateProjectTag(index, 0, event.target.value, "es")
                    }
                  />
                </Field>
                <Field label="Tag 1 (EN)">
                  <input
                    className={inputClass}
                    value={project.tagsEn[0]}
                    onChange={(event) =>
                      updateProjectTag(index, 0, event.target.value, "en")
                    }
                  />
                </Field>
                <Field label="Tag 2 (ES)">
                  <textarea
                    className={`${inputClass} min-h-20 resize-y`}
                    value={project.tags[1]}
                    onChange={(event) =>
                      updateProjectTag(index, 1, event.target.value, "es")
                    }
                  />
                </Field>
                <Field label="Tag 2 (EN)">
                  <textarea
                    className={`${inputClass} min-h-20 resize-y`}
                    value={project.tagsEn[1]}
                    onChange={(event) =>
                      updateProjectTag(index, 1, event.target.value, "en")
                    }
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-black/8 bg-white/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg tracking-[-0.03em]">Expertises</h2>
          <button
            type="button"
            className={buttonClass}
            onClick={addExpertiseItem}
          >
            Add expertise
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Section title (ES)">
            <input
              className={inputClass}
              value={expertises.title}
              onChange={(event) =>
                updateExpertisesMeta("title", event.target.value)
              }
            />
          </Field>
          <Field label="Section title (EN)">
            <input
              className={inputClass}
              value={expertises.titleEn}
              onChange={(event) =>
                updateExpertisesMeta("titleEn", event.target.value)
              }
            />
          </Field>
          <Field label="Panel CTA (ES)">
            <input
              className={inputClass}
              value={expertises.cta}
              onChange={(event) =>
                updateExpertisesMeta("cta", event.target.value)
              }
            />
          </Field>
          <Field label="Panel CTA (EN)">
            <input
              className={inputClass}
              value={expertises.ctaEn}
              onChange={(event) =>
                updateExpertisesMeta("ctaEn", event.target.value)
              }
            />
          </Field>
        </div>

        <div className="flex flex-col gap-5">
          {expertises.items.map((item, index) => (
            <div
              key={`expertise-${index}-${item.id}`}
              className="flex flex-col gap-4 rounded-2xl border border-black/6 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="text-sm tracking-[0.12em] uppercase opacity-55">
                  Expertise {item.id}
                </p>
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => removeExpertiseItem(index)}
                  disabled={expertises.items.length <= 1}
                >
                  Remove
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-black/8 bg-[#e8e6e0]">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.imageAlt || item.title}
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
                    fileInputs.current[`expertise-${index}`] = node;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void uploadExpertiseImage(index, file);
                  }}
                />
                <button
                  type="button"
                  className={buttonClass}
                  disabled={uploadingKey === `expertise-${index}`}
                  onClick={() =>
                    fileInputs.current[`expertise-${index}`]?.click()
                  }
                >
                  {uploadingKey === `expertise-${index}`
                    ? "Uploading..."
                    : item.image
                      ? "Replace image"
                      : "Upload image"}
                </button>
                {item.image ? (
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() => clearExpertiseImage(index)}
                  >
                    Remove image
                  </button>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="ID">
                  <input
                    className={inputClass}
                    value={item.id}
                    onChange={(event) =>
                      updateExpertiseItem(index, "id", event.target.value)
                    }
                  />
                </Field>
                <Field label="Panel color">
                  <input
                    className={`${inputClass} font-mono`}
                    value={item.color}
                    onChange={(event) =>
                      updateExpertiseItem(index, "color", event.target.value)
                    }
                  />
                </Field>
                <Field label="Title (ES)">
                  <input
                    className={inputClass}
                    value={item.title}
                    onChange={(event) =>
                      updateExpertiseItem(index, "title", event.target.value)
                    }
                  />
                </Field>
                <Field label="Title (EN)">
                  <input
                    className={inputClass}
                    value={item.titleEn}
                    onChange={(event) =>
                      updateExpertiseItem(index, "titleEn", event.target.value)
                    }
                  />
                </Field>
                <Field label="Image alt (ES)">
                  <input
                    className={inputClass}
                    value={item.imageAlt}
                    onChange={(event) =>
                      updateExpertiseItem(index, "imageAlt", event.target.value)
                    }
                  />
                </Field>
                <Field label="Image alt (EN)">
                  <input
                    className={inputClass}
                    value={item.imageAltEn}
                    onChange={(event) =>
                      updateExpertiseItem(
                        index,
                        "imageAltEn",
                        event.target.value,
                      )
                    }
                  />
                </Field>
                <Field label="Services (ES) — one per line">
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    value={item.services.join("\n")}
                    onChange={(event) =>
                      updateExpertiseItem(
                        index,
                        "services",
                        linesToList(event.target.value),
                      )
                    }
                  />
                </Field>
                <Field label="Services (EN) — one per line">
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    value={item.servicesEn.join("\n")}
                    onChange={(event) =>
                      updateExpertiseItem(
                        index,
                        "servicesEn",
                        linesToList(event.target.value),
                      )
                    }
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-black/8 bg-white/70 p-5 sm:p-6">
        <h2 className="text-lg tracking-[-0.03em]">Closing / Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Headline (ES) — use line breaks">
            <textarea
              className={`${inputClass} min-h-28 resize-y`}
              value={closing.headline}
              onChange={(event) =>
                updateClosing("headline", event.target.value)
              }
            />
          </Field>
          <Field label="Headline (EN) — use line breaks">
            <textarea
              className={`${inputClass} min-h-28 resize-y`}
              value={closing.headlineEn}
              onChange={(event) =>
                updateClosing("headlineEn", event.target.value)
              }
            />
          </Field>
          <Field label="CTA label (ES)">
            <input
              className={inputClass}
              value={closing.cta}
              onChange={(event) => updateClosing("cta", event.target.value)}
            />
          </Field>
          <Field label="CTA label (EN)">
            <input
              className={inputClass}
              value={closing.ctaEn}
              onChange={(event) => updateClosing("ctaEn", event.target.value)}
            />
          </Field>
          <Field label="CTA link">
            <input
              className={inputClass}
              value={closing.ctaHref}
              onChange={(event) => updateClosing("ctaHref", event.target.value)}
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputClass}
              value={closing.phone}
              onChange={(event) => updateClosing("phone", event.target.value)}
            />
          </Field>
          <Field label="Address — one line per row">
            <textarea
              className={`${inputClass} min-h-28 resize-y`}
              value={closing.address.join("\n")}
              onChange={(event) =>
                updateClosing("address", linesToList(event.target.value))
              }
            />
          </Field>
          <Field label="Emails — one per line">
            <textarea
              className={`${inputClass} min-h-28 resize-y`}
              value={closing.emails.join("\n")}
              onChange={(event) =>
                updateClosing("emails", linesToList(event.target.value))
              }
            />
          </Field>
          <Field label="Legal label (ES)">
            <input
              className={inputClass}
              value={closing.legal}
              onChange={(event) => updateClosing("legal", event.target.value)}
            />
          </Field>
          <Field label="Legal label (EN)">
            <input
              className={inputClass}
              value={closing.legalEn}
              onChange={(event) => updateClosing("legalEn", event.target.value)}
            />
          </Field>
          <Field label="Legal link">
            <input
              className={inputClass}
              value={closing.legalHref}
              onChange={(event) =>
                updateClosing("legalHref", event.target.value)
              }
            />
          </Field>
          <Field label="Copyright">
            <input
              className={inputClass}
              value={closing.copyright}
              onChange={(event) =>
                updateClosing("copyright", event.target.value)
              }
            />
          </Field>
        </div>
      </section>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-[#f0efeb]/95 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={pending || uploadingKey !== null}
          className="rounded-full bg-[#161616] px-5 py-2.5 text-sm text-white transition-opacity disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
        {message ? <p className="text-sm opacity-70">{message}</p> : null}
      </div>
    </div>
  );
}
