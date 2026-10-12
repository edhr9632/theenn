"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { prepareNewsImage } from "@/lib/newsImageUpload";
import {
  toVideoEditorPlaceholderHtml,
  videoEmbedsToPlaceholders,
  videoPlaceholdersToEmbeds,
} from "@/lib/videoEmbed";

type AdminBlogEditorProps = {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
};

export default function AdminBlogEditor({
  name = "content",
  defaultValue = "",
  placeholder = "Start writing your story…",
}: AdminBlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [html, setHtml] = useState(() => videoPlaceholdersToEmbeds(defaultValue));
  const [mode, setMode] = useState<"visual" | "code" | "preview">("visual");
  const [showLink, setShowLink] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [videoUrl, setVideoUrl] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [imageBusy, setImageBusy] = useState(false);
  const uid = useId();

  const countWords = (rawHtml: string) => {
    const text = rawHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return text ? text.split(" ").length : 0;
  };

  const syncFromEditor = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const next = videoPlaceholdersToEmbeds(el.innerHTML);
    setHtml(next);
    setWordCount(countWords(next));
  }, []);

  const rememberSelection = useCallback(() => {
    const el = editorRef.current;
    const selection = window.getSelection();
    if (!el || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return;
    savedRangeRef.current = range.cloneRange();
  }, []);

  const restoreSelection = useCallback(() => {
    const el = editorRef.current;
    const selection = window.getSelection();
    if (!el || !selection) return false;

    el.focus();
    selection.removeAllRanges();

    if (savedRangeRef.current) {
      selection.addRange(savedRangeRef.current);
      return true;
    }

    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    selection.addRange(range);
    return true;
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || el.innerHTML) return;
    if (!defaultValue) return;
    el.innerHTML = videoEmbedsToPlaceholders(defaultValue);
    syncFromEditor();
  }, [defaultValue, syncFromEditor]);

  const run = (command: string, value?: string) => {
    restoreSelection();
    document.execCommand(command, false, value);
    syncFromEditor();
    rememberSelection();
  };

  const insertHtmlAtCursor = (snippet: string) => {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      const el = editorRef.current;
      if (el) {
        el.insertAdjacentHTML("beforeend", snippet);
        syncFromEditor();
      }
      return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const template = document.createElement("template");
    template.innerHTML = snippet;
    const fragment = template.content;
    const lastNode = fragment.lastChild;
    range.insertNode(fragment);

    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      savedRangeRef.current = range.cloneRange();
    }

    syncFromEditor();
  };

  const applyLink = () => {
    if (!linkUrl.trim()) return;
    run("createLink", linkUrl.trim());
    setShowLink(false);
    setLinkUrl("https://");
  };

  const applyVideo = () => {
    const embed = toVideoEditorPlaceholderHtml(videoUrl);
    if (!embed) {
      window.alert("Paste a valid YouTube or Vimeo URL.");
      return;
    }
    insertHtmlAtCursor(embed);
    setShowVideo(false);
    setVideoUrl("");
  };

  const onImageFile = async (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageBusy(true);
    try {
      const src = await prepareNewsImage(file, "article-inline");
      insertHtmlAtCursor(
        `<figure class="wp-block-image"><img src="${src}" alt="" /><figcaption>Image caption</figcaption></figure><p></p>`,
      );
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not insert image.");
    } finally {
      setImageBusy(false);
    }
  };

  const openVideoPopover = () => {
    rememberSelection();
    setShowLink(false);
    setShowVideo(true);
  };

  const openLinkPopover = () => {
    rememberSelection();
    setShowVideo(false);
    setShowLink(true);
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
                if (key === "visual" && editorRef.current) {
                  editorRef.current.innerHTML = videoEmbedsToPlaceholders(html);
                }
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
            <button type="button" className="admin-blog-tool" title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => run("bold")}>
              <strong>B</strong>
            </button>
            <button type="button" className="admin-blog-tool" title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => run("italic")}>
              <em>I</em>
            </button>
            <button type="button" className="admin-blog-tool" title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => run("underline")}>
              <span style={{ textDecoration: "underline" }}>U</span>
            </button>
            <span className="admin-blog-tool-sep" aria-hidden="true" />
            <button type="button" className="admin-blog-tool" title="Heading 2" onMouseDown={(e) => e.preventDefault()} onClick={() => run("formatBlock", "h2")}>
              H2
            </button>
            <button type="button" className="admin-blog-tool" title="Heading 3" onMouseDown={(e) => e.preventDefault()} onClick={() => run("formatBlock", "h3")}>
              H3
            </button>
            <button type="button" className="admin-blog-tool" title="Paragraph" onMouseDown={(e) => e.preventDefault()} onClick={() => run("formatBlock", "p")}>
              ¶
            </button>
            <span className="admin-blog-tool-sep" aria-hidden="true" />
            <button type="button" className="admin-blog-tool" title="Bullet list" onMouseDown={(e) => e.preventDefault()} onClick={() => run("insertUnorderedList")}>
              • List
            </button>
            <button type="button" className="admin-blog-tool" title="Numbered list" onMouseDown={(e) => e.preventDefault()} onClick={() => run("insertOrderedList")}>
              1. List
            </button>
            <button type="button" className="admin-blog-tool" title="Quote" onMouseDown={(e) => e.preventDefault()} onClick={() => run("formatBlock", "blockquote")}>
              “ ”
            </button>
            <span className="admin-blog-tool-sep" aria-hidden="true" />
            <button type="button" className="admin-blog-tool" title="Insert link" onMouseDown={(e) => e.preventDefault()} onClick={openLinkPopover}>
              Link
            </button>
            <button
              type="button"
              className="admin-blog-tool"
              title="Insert image"
              disabled={imageBusy}
              onMouseDown={(e) => {
                e.preventDefault();
                rememberSelection();
              }}
              onClick={() => fileRef.current?.click()}
            >
              {imageBusy ? "…" : "Image"}
            </button>
            <button
              type="button"
              className="admin-blog-tool admin-blog-tool--accent"
              title="Embed video"
              onMouseDown={(e) => e.preventDefault()}
              onClick={openVideoPopover}
            >
              ▶ Video
            </button>
            <button type="button" className="admin-blog-tool" title="Horizontal line" onMouseDown={(e) => e.preventDefault()} onClick={() => insertHtmlAtCursor("<hr /><p></p>")}>
              ―
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={(e) => {
                void onImageFile(e.target.files?.[0] ?? null);
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          applyVideo();
                        }
                      }}
                    />
                  </label>
                  <p className="admin-blog-hint mb-0">
                    Click in the article where the video should appear, then paste the URL and embed. It stays in that spot.
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
            onBlur={() => {
              rememberSelection();
              syncFromEditor();
            }}
            onMouseUp={rememberSelection}
            onKeyUp={rememberSelection}
          />
        </>
      ) : null}

      {mode === "code" ? (
        <textarea
          className="admin-field admin-blog-code"
          value={html}
          onChange={(e) => {
            setHtml(e.target.value);
            setWordCount(countWords(e.target.value));
          }}
          rows={18}
          spellCheck={false}
        />
      ) : null}

      {mode === "preview" ? (
        <div
          className="admin-blog-preview"
          dangerouslySetInnerHTML={{ __html: html || "<p><em>Nothing to preview yet.</em></p>" }}
        />
      ) : null}

      <input type="hidden" name={name} value={html} readOnly />
      <div className="admin-blog-footer">
        <span>{wordCount} words</span>
        <span>Tip: click in the text first, then ▶ Video — the clip stays where your cursor was</span>
      </div>
    </div>
  );
}
