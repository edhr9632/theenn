import Image from "next/image";

export type PanelDiscussionItem = {
  episode: string;
  duration: string;
  topic: string;
  title: string;
  speakers: string;
  image: string;
  youtube: string;
};

export default function PanelDiscussionCard({
  panel,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: {
  panel: PanelDiscussionItem;
  sizes?: string;
}) {
  return (
    <a
      href={panel.youtube}
      className="panel-disco-card text-decoration-none d-flex flex-column bg-white rounded-3 shadow-sm overflow-hidden h-100"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="panel-disco-media ratio ratio-16x9">
        <div className="panel-disco-media-inner">
          <Image src={panel.image} alt="" fill className="panel-disco-thumb object-fit-cover" sizes={sizes} />
          <span className="panel-disco-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
            </svg>
            Panel
          </span>
          <span className="panel-disco-yt-play" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
            </svg>
          </span>
          <div className="panel-disco-media-bar" aria-hidden="true">
            <div className="panel-disco-media-actions">
              <span className="panel-disco-media-action">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11 2.5a2.5 2.5 0 1 1 .603 4.92l-1.07 1.07a3.5 3.5 0 0 0-4.28 4.28l1.07-1.07a2.5 2.5 0 1 1 3.422-3.422l-1.07 1.07a3.5 3.5 0 0 0 4.28-4.28l1.07 1.07A2.5 2.5 0 1 1 11 2.5z" />
                </svg>
                Share
              </span>
              <span className="panel-disco-media-action">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                </svg>
                Watch later
              </span>
            </div>
            <span className="panel-disco-yt-label">Watch on YouTube</span>
          </div>
          <span className="panel-disco-duration">{panel.duration}</span>
        </div>
      </div>
      <div className="panel-disco-body p-3 p-md-4 d-flex flex-column flex-grow-1">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
          <span className="panel-disco-cat text-uppercase small fw-semibold">Panel discussion</span>
          <span className="panel-disco-episode small text-muted">{panel.episode}</span>
        </div>
        <p className="panel-disco-topic small fw-semibold mb-1">{panel.topic}</p>
        <h3 className="panel-disco-cardtitle serif-headline h6 mt-1 mb-2 lh-sm">{panel.title}</h3>
        <p className="panel-disco-speakers small text-muted mb-0 mt-auto">{panel.speakers}</p>
      </div>
    </a>
  );
}
