import { ContentEditor } from "@/components/content-editor";
import { getSiteContent } from "@/lib/content";

export default async function EditPage() {
  const content = await getSiteContent();

  return (
    <main className="min-h-dvh bg-[#f0efeb] px-5 py-10 text-[#0a0a0c] sm:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-6">
          <div>
            <p className="text-xs tracking-[0.16em] uppercase opacity-55">
              Content
            </p>
            <h1 className="mt-2 text-3xl tracking-[-0.04em]">Edit site</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 opacity-70">
              Edit brand, menu, socials, projects, expertises, and the closing
              contact section. Images go in{" "}
              <code className="rounded bg-black/5 px-1.5 py-0.5">
                public/uploads
              </code>
              ; text saves to{" "}
              <code className="rounded bg-black/5 px-1.5 py-0.5">
                content/site.json
              </code>
              .
            </p>
          </div>
          <a
            href="/"
            className="rounded-full border border-black/15 px-4 py-2 text-sm transition-colors hover:bg-black hover:text-white"
          >
            View site
          </a>
        </header>

        <ContentEditor initialContent={content} />
      </div>
    </main>
  );
}
