"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

type AdminBlogEditorProps = {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
};

function toEmbedHtml(rawUrl: string): string | null {
  const url = rawUrl.trim();
  if (!url) return null;

  const yt =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/) ??
    null;
  if (yt?.[1]) {
    return `<div class="wp-block-embed is-type-video is-provider-youtube"><div class="admin-embed-frame"><iframe src="https://www.youtube.com/embed/${yt[1]}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div></div><p></p>`;
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo?.[1]) {
    return `<div class="wp-block-embed is-type-video is-provider-vimeo"><div class="admin-embed-frame"><iframe src="https://player.vimeo.com/video/${vimeo[1]}" title="Vimeo video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div></div><p></p>`;
  }

  return `<div class="wp-block-embed is-type-video"><div class="admin-embed-frame"><iframe src="${url.replace(/"/g, "&quot;")}" title="Embedded video" allowfullscreen loading="lazy"></iframe></div></div><p></p>`;
}

export default function AdminBlogEditor({
  name = "content",
  defaultValue = "",
  placeholder = "Start writing your story…",
}: AdminBlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState(defaultValue);
  const [mode, setMode] = useState<"visual" | "code" | "preview">("visual");
  const [showLink, setShowLink] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [videoUrl, setVideoUrl] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const uid = useId();

  const syncFromEditor = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const next = el.innerHTML;
    setHtml(next);
    const text = el.innerText.replace(/\s+/g, " ").trim();
    setWordCount(text ? text.split(" ").length : 0);
  }, []);

  useEffect(() => {
    if (editorRef.current && defaultValue && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = defaultValue;
      syncFromEditor();
    }
  }, [defaultValue, syncFromEditor]);

  const focusEditor = () => editorRef.current?.focus();

  const run = (command: string, value?: string) => {
    focusEditor();
    document.execCommand(command, false, value);
    syncFromEditor();
  };

  const insertHtml = (snippet: string) => {
    focusEditor();
    document.execCommand("insertHTML", false, snippet);
    syncFromEditor();
  };

  const applyLink = () => {
    if (!linkUrl.trim()) return;
    run("createLink", linkUrl.trim());
    setShowLink(false);
    setLinkUrl("https://");
  };

  const applyVideo = () => {
    const embed = toEmbedHtml(videoUrl);
    if (!embed) return;
    insertHtml(embed);
    setShowVideo(false);
    setVideoUrl("");
  };

  const onImageFile = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result ?? "");
      insertHtml(
        `<figure class="wp-block-image"><img src="${src}" alt="" /><figcaption>Image caption</figcaption></figure><p></p>`,
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="admin-blog-editor admin-field-span">
      <div className="admin-blog-editor-top">
        <p className="admin-blog-editor-label mb-0">Content</p>
        <div className="admin-blog-mode-tabs" role="tablist" aria-label="Editor mode">
          {(
            [
              ["visual", "Visual"],
              ["code", "Code"],
              ["preview", "Preview"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              className={`admin-blog-mode-tab${mode === key ? " is-active" : ""}`}
              onClick={() => {
                if (mode === "visual") syncFromEditor();
                setMode(key);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === "visual" ? (
        <>
          <div className="admin-blog-toolbar" role="toolbar" aria-label="Formatting">
            <button type="button" className="admin-blog-tool" title="Bold" onClick={() => run("bold")}>
              <strong>B</strong>
            </button>
            <button type="button" className="admin-blog-tool" title="Italic" onClick={() => run("italic")}>
              <em>I</em>
            </button>
            <button type="button" className="admin-blog-tool" title="Underline" onClick={() => run("underline")}>
              <span style={{ textDecoration: "underline" }}>U</span>
            </button>
            <span className="admin-blog-tool-sep" aria-hidden="true" />
            <button type="button" className="admin-blog-tool" title="Heading 2" onClick={() => run("formatBlock", "h2")}>
              H2
            </button>
            <button type="button" className="admin-blog-tool" title="Heading 3" onClick={() => run("formatBlock", "h3")}>
              H3
            </button>
            <button
              type="button"
              className="admin-blog-tool"
              title="Paragraph"
              onClick={() => run("formatBlock", "p")}
            >
              ¶
            </button>
            <span className="admin-blog-tool-sep" aria-hidden="true" />
            <button
              type="button"
              className="admin-blog-tool"
              title="Bullet list"
              onClick={() => run("insertUnorderedList")}
            >
              • List
            </button>
            <button
              type="button"
              className="admin-blog-tool"
              title="Numbered list"
              onClick={() => run("insertOrderedList")}
            >
              1. List
            </button>
            <button
              type="button"
              className="admin-blog-tool"
              title="Quote"
              onClick={() => run("formatBlock", "blockquote")}
            >
              “ ”
            </button>
            <span className="admin-blog-tool-sep" aria-hidden="true" />
            <button type="button" className="admin-blog-tool" title="Insert link" onClick={() => setShowLink(true)}>
              Link
            </button>
            <button
              type="button"
              className="admin-blog-tool"
              title="Insert image"
              onClick={() => fileRef.current?.click()}
            >
              Image
            </button>
            <button
              type="button"
              className="admin-blog-tool admin-blog-tool--accent"
              title="Embed video"
              onClick={() => setShowVideo(true)}
            >
              ▶ Video
            </button>
            <button
              type="button"
              className="admin-blog-tool"
              title="Horizontal line"
              onClick={() => insertHtml("<hr /><p></p>")}
            >
              ―
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={(e) => {
                onImageFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </div>

          {(showLink || showVideo) && (
            <div className="admin-blog-popover">
              {showLink ? (
                <>
                  <label className="admin-field-label" htmlFor={`${uid}-link`}>
                    Insert link
                    <input
                      id={`${uid}-link`}
                      className="admin-field"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://…"
                    />
                  </label>
                  <div className="admin-blog-popover-actions">
                    <button type="button" className="btn admin-btn-ghost btn-sm" onClick={() => setShowLink(false)}>
                      Cancel
                    </button>
                    <button type="button" className="btn admin-btn-primary btn-sm" onClick={applyLink}>
                      Insert link
                    </button>
                  </div>
                </>
              ) : null}
              {showVideo ? (
                <>
                  <label className="admin-field-label" htmlFor={`${uid}-video`}>
                    Embed video (YouTube / Vimeo URL)
                    <input
                      id={`${uid}-video`}
                      className="admin-field"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=…"
                    />
                  </label>
                  <p className="admin-blog-hint mb-0">
                    Paste a YouTube or Vimeo link — it will embed like WordPress media blocks.
                  </p>
                  <div className="admin-blog-popover-actions">
                    <button type="button" className="btn admin-btn-ghost btn-sm" onClick={() => setShowVideo(false)}>
                      Cancel
                    </button>
                    <button type="button" className="btn admin-btn-primary btn-sm" onClick={applyVideo}>
                      Embed video
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          <div
            ref={editorRef}
            className="admin-blog-canvas"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="Article content"
            data-placeholder={placeholder}
            onInput={syncFromEditor}
            onBlur={syncFromEditor}
          />
        </>
      ) : null}

      {mode === "code" ? (
        <textarea
          className="admin-field admin-blog-code"
          value={html}
          onChange={(e) => {
            setHtml(e.target.value);
            const text = e.target.value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
            setWordCount(text ? text.split(" ").length : 0);
          }}
          rows={18}
          spellCheck={false}
        />
      ) : null}

      {mode === "preview" ? (
        <div className="admin-blog-preview" dangerouslySetInnerHTML={{ __html: html || "<p><em>Nothing to preview yet.</em></p>" }} />
      ) : null}

      <input type="hidden" name={name} value={html} readOnly />
      <div className="admin-blog-footer">
        <span>{wordCount} words</span>
        <span>Tip: use ▶ Video to embed YouTube/Vimeo like WordPress</span>
      </div>
    </div>
  );
}
