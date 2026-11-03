
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type AdminVideo = {
  youtube_id: string;
  title: string;
  name?: string | null;
  description?: string | null;
  category: string;
  featured: boolean;
  is_hidden: boolean;
  created_at?: string;
};

type AccessState =
  | "checking"
  | "signed-out"
  | "forbidden"
  | "error"
  | "ready";

const CATEGORIES = [
  "Live Stream",
  "LevelUp",
  "Featured",
  "Football",
  "Movies",
];

const emptyForm = {
  youtubeUrl: "",
  title: "",
  name: "",
  description: "",
  category: "Football",
  featured: false,
};

export default function AdminVideosPage() {
  const supabase = useMemo(() => createClient(), []);

  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [access, setAccess] = useState<AccessState>("checking");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const getToken = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    return session.access_token;
  };

  const apiRequest = async (
    method: "GET" | "POST" | "PATCH" | "DELETE",
    body?: Record<string, unknown>,
  ) => {
    const token = await getToken();

    const response = await fetch("/api/admin/videos", {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({}));

    if (response.status === 401) {
      setAccess("signed-out");
      throw new Error("Please sign in again.");
    }

    if (response.status === 403) {
      setAccess("forbidden");
      throw new Error("Administrator access only.");
    }

    if (!response.ok) {
      throw new Error(result.error || `Request failed (${response.status}).`);
    }

    return result;
  };

  const loadVideos = useCallback(async () => {
    setAccess("checking");
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const token = await getToken();

      const response = await fetch("/api/admin/videos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setAccess("signed-out");
        return;
      }

      if (response.status === 403) {
        setAccess("forbidden");
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || "Unable to load videos.");
      }

      if (!Array.isArray(result.videos)) {
        throw new Error("Unexpected response from the videos API.");
      }

      setVideos(result.videos as AdminVideo[]);
      setAccess("ready");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load videos.",
      );
      setAccess((current) =>
        current === "signed-out" || current === "forbidden"
          ? current
          : "error",
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadVideos();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setVideos([]);
        setAccess("signed-out");
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void loadVideos();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadVideos, supabase]);

  const visibleVideos = useMemo(() => {
    const term = search.trim().toLowerCase();

    return videos.filter((video) => {
      const matchesSearch = [
        video.title,
        video.name,
        video.description,
        video.category,
        video.youtube_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);

      const matchesFilter =
        filter === "all" ||
        (filter === "visible" && !video.is_hidden) ||
        (filter === "hidden" && video.is_hidden) ||
        (filter === "featured" && video.featured);

      return matchesSearch && matchesFilter;
    });
  }, [videos, search, filter]);

  const updateForm = (
    field: keyof typeof emptyForm,
    value: string | boolean,
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const addVideo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await apiRequest("POST", {
        youtubeUrl: form.youtubeUrl.trim(),
        title: form.title.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        featured: form.featured,
      });

      resetForm();
      setNotice("YouTube video added successfully.");
      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add video.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (video: AdminVideo) => {
    setEditingId(video.youtube_id);
    setForm({
      youtubeUrl: `https://www.youtube.com/watch?v=${video.youtube_id}`,
      title: video.title,
      name: video.name || "",
      description: video.description || "",
      category: video.category,
      featured: video.featured,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingId) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await apiRequest("PATCH", {
        youtube_id: editingId,
        title: form.title.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        featured: form.featured,
      });

      resetForm();
      setNotice("Video details updated successfully.");
      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update video.");
    } finally {
      setSaving(false);
    }
  };

  const toggleHidden = async (video: AdminVideo) => {
    setError("");
    setNotice("");

    try {
      await apiRequest("PATCH", {
        youtube_id: video.youtube_id,
        is_hidden: !video.is_hidden,
      });

      setNotice(
        video.is_hidden
          ? "Video is now visible."
          : "Video has been hidden from the website.",
      );

      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change visibility.");
    }
  };

  const toggleFeatured = async (video: AdminVideo) => {
    setError("");
    setNotice("");

    try {
      await apiRequest("PATCH", {
        youtube_id: video.youtube_id,
        featured: !video.featured,
      });

      setNotice("Featured setting updated.");
      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update video.");
    }
  };

  const deleteVideo = async (video: AdminVideo) => {
    const confirmed = window.confirm(
      `Permanently delete "${video.title}" from the Admin YouTube library? This cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await apiRequest("DELETE", {
        youtube_id: video.youtube_id,
      });

      if (editingId === video.youtube_id) resetForm();

      setNotice("Video deleted from the Admin YouTube library.");
      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete video.");
    }
  };

  if (access !== "ready") {
    const signedOut = access === "signed-out";
    const forbidden = access === "forbidden";
    const checking = access === "checking";

    return (
      <main className="auth-screen">
        <div className="auth-card">
          <Link href="/" className="brand">
            PALMYRA<span>.</span>
          </Link>
          <div className="caption">STORE ADMINISTRATION</div>

          {checking ? (
            <>
              <div className="loader" />
              <h1>Verifying access</h1>
              <p>Please wait while we verify your administrator access.</p>
            </>
          ) : signedOut ? (
            <>
              <h1>Sign-in required</h1>
              <p>Sign in with your administrator account to manage videos.</p>
              <Link href="/login?next=/admin/videos" className="button">
                Go to sign in →
              </Link>
            </>
          ) : forbidden ? (
            <>
              <h1>Administrator access only</h1>
              <p>Your account is not authorized to manage videos.</p>
              <Link href="/login?next=/admin/videos" className="button">
                Return to sign in →
              </Link>
            </>
          ) : (
            <>
              <h1>Unable to load videos</h1>
              <p>{error || "Something went wrong."}</p>
              <button className="button" onClick={() => void loadVideos()}>
                Try again
              </button>
            </>
          )}

          <Link href="/admin" className="back-link">
            ← Back to orders dashboard
          </Link>
        </div>

        <style jsx>{`
          .auth-screen {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            box-sizing: border-box;
            background: #090909;
            color: #fff;
            font-family: Arial, sans-serif;
          }
          .auth-card {
            width: 100%;
            max-width: 420px;
            padding: 36px;
            box-sizing: border-box;
            border: 1px solid #303030;
            border-radius: 18px;
            background: #121212;
            text-align: center;
          }
          .brand {
            color: #fff;
            font-size: 29px;
            font-weight: 900;
            letter-spacing: 3px;
            text-decoration: none;
          }
          .brand span { color: #e11d2e; }
          .caption {
            margin: 10px 0 30px;
            color: #888;
            font-size: 10px;
            letter-spacing: 2px;
          }
          h1 { font-size: 25px; }
          p { color: #aaa; font-size: 14px; line-height: 1.7; }
          .button {
            display: inline-flex;
            justify-content: center;
            margin-top: 18px;
            padding: 13px 20px;
            border: 0;
            border-radius: 9px;
            background: #e11d2e;
            color: #fff;
            font-weight: 700;
            text-decoration: none;
            cursor: pointer;
          }
          .back-link {
            display: block;
            margin-top: 28px;
            color: #aaa;
            font-size: 13px;
            text-decoration: none;
          }
          .loader {
            width: 30px;
            height: 30px;
            margin: 0 auto 20px;
            border: 3px solid #333;
            border-top-color: #e11d2e;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 30px;
          box-sizing: border-box;
          background: #090909;
          color: #f5f5f5;
          font-family: Arial, Helvetica, sans-serif;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 28px;
        }
        .brand {
          font-size: 25px;
          font-weight: 900;
          letter-spacing: 2px;
        }
        .brand span { color: #e11d2e; }
        .subtitle { margin-top: 7px; color: #929292; font-size: 13px; }
        .actions { display: flex; flex-wrap: wrap; gap: 10px; }
        .button, .nav-link {
          display: inline-flex;
          min-height: 42px;
          box-sizing: border-box;
          align-items: center;
          justify-content: center;
          padding: 10px 15px;
          border: 1px solid #333;
          border-radius: 9px;
          background: #171717;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
        }
        .primary {
          border-color: #e11d2e;
          background: #e11d2e;
        }
        button:disabled { opacity: 0.55; cursor: not-allowed; }
        .navigation {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 28px;
          padding: 12px;
          border: 1px solid #292929;
          border-radius: 13px;
          background: #111;
        }
        .active {
          border-color: #e11d2e;
          background: #291114;
        }
        .heading { margin-bottom: 22px; }
        .heading h1 {
          margin: 0;
          font-size: clamp(28px, 4vw, 38px);
          letter-spacing: -1px;
        }
        .heading p {
          color: #999;
          font-size: 14px;
          line-height: 1.7;
        }
        .notice, .error, .info {
          margin: 15px 0;
          padding: 14px 16px;
          border: 1px solid #333;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }
        .notice {
          border-color: #285c3c;
          background: #102117;
          color: #a9edc0;
        }
        .error {
          border-color: #71313a;
          background: #241114;
          color: #ffb8bf;
        }
        .info {
          border-color: #55451f;
          background: #201b10;
          color: #e9d59c;
        }
        .panel {
          margin-top: 20px;
          padding: 22px;
          border: 1px solid #292929;
          border-radius: 14px;
          background: #111;
        }
        .panel h2 {
          margin: 0 0 18px;
          font-size: 19px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }
        .field {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 8px;
        }
        .full { grid-column: 1 / -1; }
        label {
          color: #bbb;
          font-size: 12px;
          font-weight: 700;
        }
        input, textarea, select {
          width: 100%;
          min-height: 43px;
          box-sizing: border-box;
          padding: 11px 12px;
          border: 1px solid #333;
          border-radius: 9px;
          outline: none;
          background: #151515;
          color: #fff;
          font: inherit;
          font-size: 13px;
        }
        textarea { min-height: 90px; resize: vertical; }
        input:focus, textarea:focus, select:focus {
          border-color: #a43a44;
        }
        .check-row {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ddd;
          font-size: 13px;
        }
        .check-row input {
          width: 17px;
          min-height: 17px;
          accent-color: #e11d2e;
        }
        .form-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }
        .muted { color: #929292; font-size: 12px; line-height: 1.6; }
        .toolbar {
          display: flex;
          gap: 12px;
          margin-bottom: 18px;
        }
        .toolbar input { flex: 1; min-width: 180px; }
        .toolbar select { width: 190px; }
        .video-list {
          display: grid;
          gap: 13px;
        }
        .video-card {
          display: grid;
          grid-template-columns: 170px minmax(0, 1fr);
          gap: 17px;
          padding: 14px;
          border: 1px solid #292929;
          border-radius: 12px;
          background: #151515;
        }
        .thumbnail {
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          border-radius: 8px;
          background: #222;
        }
        .video-content { min-width: 0; }
        .video-title {
          margin: 0;
          color: #fff;
          font-size: 16px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }
        .video-meta {
          margin-top: 7px;
          color: #999;
          font-size: 12px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }
        .badges {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 10px;
        }
        .badge {
          padding: 5px 8px;
          border: 1px solid #414141;
          border-radius: 20px;
          color: #ccc;
          font-size: 10px;
          font-weight: 700;
        }
        .badge-red {
          border-color: #71313a;
          background: #281215;
          color: #ff9ca5;
        }
        .video-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 13px;
        }
        .small-button {
          min-height: 34px;
          padding: 8px 11px;
          border: 1px solid #3a3a3a;
          border-radius: 8px;
          background: #202020;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }
        .danger {
          border-color: #71313a;
          color: #ff9ca5;
        }
        .empty {
          padding: 35px 15px;
          color: #999;
          text-align: center;
          line-height: 1.7;
        }
        @media (max-width: 700px) {
          .page { padding: 18px 12px; }
          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }
          .actions { width: 100%; }
          .actions .button { flex: 1; }
          .navigation {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .nav-link { text-align: center; }
          .form-grid { grid-template-columns: 1fr; }
          .full { grid-column: auto; }
          .panel { padding: 15px; }
          .toolbar { flex-direction: column; }
          .toolbar input, .toolbar select {
            width: 100%;
            min-width: 0;
          }
          .video-card { grid-template-columns: 1fr; }
          .thumbnail { max-width: 100%; }
        }
      `}</style>

      <div className="container">
        <header className="topbar">
          <div>
            <div className="brand">PALMYRA<span>.</span></div>
            <div className="subtitle">Store administration</div>
          </div>
          <div className="actions">
            <Link href="/" className="button">View website</Link>
            <button
              className="button primary"
              onClick={() => void loadVideos()}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "↻ Refresh videos"}
            </button>
          </div>
        </header>

        <nav className="navigation">
          <Link href="/admin" className="nav-link">Orders</Link>
          <Link href="/admin/analytics" className="nav-link">Analytics</Link>
          <Link href="/admin/videos" className="nav-link active">
            Video management
          </Link>
        </nav>

        <section className="heading">
          <h1>YouTube video management</h1>
          <p>
            Add and manage YouTube videos displayed in the Palmyra video
            library. Local videos and permanent banner videos remain
            managed in VS Code.
          </p>
        </section>

        {error && <div className="error" role="alert">{error}</div>}
        {notice && <div className="notice" role="status">{notice}</div>}

        <div className="info">
          <strong>Important:</strong> This page manages only entries in
          the Admin YouTube library. It does not upload, edit or delete
          files in <code>public/videos</code>, <code>public/thumbnails</code>
          or <code>lib/videos.ts</code>.
        </div>

        <section className="panel">
          <h2>{editingId ? "Edit YouTube video" : "Add a YouTube video"}</h2>

          <form onSubmit={editingId ? saveEdit : addVideo}>
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="youtubeUrl">YouTube video URL or ID</label>
                <input
                  id="youtubeUrl"
                  value={form.youtubeUrl}
                  onChange={(event) =>
                    updateForm("youtubeUrl", event.target.value)
                  }
                  placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
                  required
                  disabled={Boolean(editingId)}
                />
                {editingId && (
                  <span className="muted">
                    The video ID cannot be changed when editing.
                  </span>
                )}
              </div>

              <div className="field">
                <label htmlFor="videoTitle">Video title</label>
                <input
                  id="videoTitle"
                  value={form.title}
                  onChange={(event) =>
                    updateForm("title", event.target.value)
                  }
                  placeholder="Enter video title"
                  maxLength={180}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="videoName">Creator / Channel name</label>
                <input
                  id="videoName"
                  value={form.name}
                  onChange={(event) =>
                    updateForm("name", event.target.value)
                  }
                  placeholder="Enter channel or creator"
                  maxLength={120}
                />
              </div>

              <div className="field">
                <label htmlFor="videoCategory">Category</label>
                <select
                  id="videoCategory"
                  value={form.category}
                  onChange={(event) =>
                    updateForm("category", event.target.value)
                  }
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field full">
                <label htmlFor="videoDescription">Description</label>
                <textarea
                  id="videoDescription"
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Enter a short description"
                  maxLength={500}
                />
              </div>

              <div className="field full">
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      updateForm("featured", event.target.checked)
                    }
                  />
                  Mark this video as featured
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="button primary"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Add YouTube video"}
              </button>

              {editingId && (
                <button
                  className="button"
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel editing
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel">
          <h2>Admin YouTube library ({videos.length})</h2>

          <div className="toolbar">
            <input
              type="search"
              placeholder="Search title, creator, category or video ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search videos"
            />
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter videos"
            >
              <option value="all">All videos</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
              <option value="featured">Featured</option>
            </select>
          </div>

          <p className="muted">
            Showing {visibleVideos.length} of {videos.length} Admin videos.
          </p>

          <div className="video-list">
            {loading ? (
              <div className="empty">Loading videos...</div>
            ) : visibleVideos.length === 0 ? (
              <div className="empty">
                No videos found. Add a YouTube video using the form above.
              </div>
            ) : (
              visibleVideos.map((video) => (
                <article className="video-card" key={video.youtube_id}>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${video.title} on YouTube`}
                  >
                    <img
                      className="thumbnail"
                      src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                      alt=""
                    />
                  </a>

                  <div className="video-content">
                    <h3 className="video-title">{video.title}</h3>

                    <div className="video-meta">
                      {video.name || "Creator not specified"} · {video.category}
                    </div>

                    {video.description && (
                      <div className="video-meta">{video.description}</div>
                    )}

                    <div className="video-meta">
                      YouTube ID: {video.youtube_id}
                    </div>

                    <div className="badges">
                      <span className="badge">{video.category}</span>
                      {video.featured && (
                        <span className="badge badge-red">Featured</span>
                      )}
                      {video.is_hidden ? (
                        <span className="badge badge-red">Hidden</span>
                      ) : (
                        <span className="badge">Visible</span>
                      )}
                    </div>

                    <div className="video-actions">
                      <button
                        className="small-button"
                        type="button"
                        onClick={() => startEditing(video)}
                      >
                        Edit details
                      </button>

                      <button
                        className="small-button"
                        type="button"
                        onClick={() => void toggleFeatured(video)}
                      >
                        {video.featured ? "Remove featured" : "Make featured"}
                      </button>

                      <button
                        className="small-button"
                        type="button"
                        onClick={() => void toggleHidden(video)}
                      >
                        {video.is_hidden ? "Unhide video" : "Hide video"}
                      </button>

                      <button
                        className="small-button danger"
                        type="button"
                        onClick={() => void deleteVideo(video)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
