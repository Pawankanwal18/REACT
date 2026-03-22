import { useState, useEffect } from "react";

const USER_IDS = Array.from({ length: 30 }, (_, i) => i + 1);

// Fetch user profile from GitHub API (with avatar URL as fallback)
const fetchUser = async (id) => {
  try {
    const res = await fetch(`https://api.github.com/users/${id}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (res.ok) {
      const data = await res.json();
      // Always override avatar_url with the direct CDN URL so it never breaks
      return { ...data, avatar_url: `https://avatars.githubusercontent.com/u/${id}?v=4` };
    }
  } catch (_) {}
  // Fallback: minimal object using direct CDN avatar (no API needed)
  return {
    id,
    login: `user-${id}`,
    name: null,
    bio: null,
    avatar_url: `https://avatars.githubusercontent.com/u/${id}?v=4`,
    html_url: `https://github.com/users/${id}`,
    public_repos: null,
    followers: null,
    following: null,
    public_gists: null,
    location: null,
    company: null,
    blog: null,
  };
};

export default function App() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show avatars immediately using direct CDN URLs, then enrich with API data
    const placeholders = USER_IDS.map((id) => ({
      id,
      login: `user-${id}`,
      name: null,
      bio: null,
      avatar_url: `https://avatars.githubusercontent.com/u/${id}?v=4`,
      html_url: `https://github.com`,
      public_repos: null,
      followers: null,
      following: null,
      public_gists: null,
      location: null,
      company: null,
      blog: null,
    }));
    setUsers(placeholders);
    setLoading(false);

    // Enrich in background — updates cards as API responses arrive
    USER_IDS.forEach(async (id) => {
      const data = await fetchUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? data : u)));
    });
  }, []);

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <span style={styles.dot} />
          <h1 style={styles.title}>dev · gallery</h1>
          <span style={styles.subtitle}>{users.length} pioneers on github</span>
        </div>
      </header>

      {/* Grid */}
      {loading ? (
        <div style={styles.loader}>
          {[...Array(9)].map((_, i) => (
            <div key={i} className="skeleton" style={styles.skeleton} />
          ))}
        </div>
      ) : (
        <main style={styles.grid}>
          {users.map((user, i) => (
            <div
              key={user.id}
              className="card"
              style={{ ...styles.card, animationDelay: `${i * 40}ms` }}
            >
              <div style={styles.cardGlow} />
              <img
                src={user.avatar_url}
                alt={user.login}
                style={styles.avatar}
                loading="lazy"
              />
              <div style={styles.cardBody}>
                <p style={styles.login}>@{user.login}</p>
                {user.name && <p style={styles.name}>{user.name}</p>}
                <div style={styles.meta}>
                  <span style={styles.badge}>#{user.id}</span>
                  {user.public_repos != null && (
                    <span style={styles.badge}>{user.public_repos} repos</span>
                  )}
                </div>
              </div>
              <button
                style={styles.viewBtn}
                className="view-btn"
                onClick={() => setSelected(user)}
              >
                View Profile →
              </button>
            </div>
          ))}
        </main>
      )}

      {/* Modal */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div
            style={styles.modal}
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button style={styles.closeBtn} onClick={() => setSelected(null)}>
              ✕
            </button>
            <div style={styles.modalBanner} />
            <img src={selected.avatar_url} alt={selected.login} style={styles.modalAvatar} />
            <div style={styles.modalContent}>
              <h2 style={styles.modalName}>{selected.name || selected.login}</h2>
              <p style={styles.modalLogin}>@{selected.login}</p>
              {selected.bio && <p style={styles.bio}>{selected.bio}</p>}

              <div style={styles.statsRow}>
                {[
                  ["Repos", selected.public_repos],
                  ["Followers", selected.followers],
                  ["Following", selected.following],
                  ["Gists", selected.public_gists],
                ].map(([label, val]) => (
                  <div key={label} style={styles.stat}>
                    <span style={styles.statVal}>{val ?? "—"}</span>
                    <span style={styles.statLabel}>{label}</span>
                  </div>
                ))}
              </div>

              {(selected.location || selected.company || selected.blog) && (
                <div style={styles.infoList}>
                  {selected.location && (
                    <span style={styles.infoItem}>📍 {selected.location}</span>
                  )}
                  {selected.company && (
                    <span style={styles.infoItem}>🏢 {selected.company}</span>
                  )}
                  {selected.blog && (
                    <span style={styles.infoItem}>
                      🔗{" "}
                      <a
                        href={selected.blog.startsWith("http") ? selected.blog : `https://${selected.blog}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.link}
                      >
                        {selected.blog}
                      </a>
                    </span>
                  )}
                </div>
              )}

              <a
                href={selected.html_url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.ghLink}
                className="gh-link"
              >
                Open on GitHub ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────── */

const C = {
  bg: "#0b0c10",
  surface: "#13151a",
  card: "#181b22",
  border: "#252830",
  accent: "#00ffe0",
  accent2: "#7c6af7",
  text: "#e8eaf0",
  muted: "#6b7280",
  white: "#ffffff",
};

const styles = {
  root: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Mono', 'Courier New', monospace",
    color: C.text,
  },
  header: {
    borderBottom: `1px solid ${C.border}`,
    padding: "2rem 2.5rem",
    background: `linear-gradient(135deg, ${C.surface} 0%, ${C.bg} 100%)`,
  },
  headerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: C.accent,
    boxShadow: `0 0 12px ${C.accent}`,
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: "1.6rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: C.white,
    textTransform: "lowercase",
  },
  subtitle: {
    marginLeft: "auto",
    fontSize: "0.75rem",
    color: C.muted,
    letterSpacing: "0.08em",
  },
  loader: {
    maxWidth: 1200,
    margin: "3rem auto",
    padding: "0 2rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "1.5rem",
  },
  skeleton: {
    height: 280,
    borderRadius: 16,
    background: C.surface,
  },
  grid: {
    maxWidth: 1200,
    margin: "3rem auto",
    padding: "0 2rem 4rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    position: "relative",
    overflow: "hidden",
    animation: "fadeUp 0.4s ease both",
    cursor: "default",
  },
  cardGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${C.accent2}22 0%, transparent 70%)`,
    pointerEvents: "none",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    border: `2px solid ${C.accent}`,
    objectFit: "cover",
    transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
    boxShadow: `0 0 10px ${C.accent}99, 0 0 24px ${C.accent}44, 0 0 40px ${C.accent}22`,
  },
  cardBody: {
    textAlign: "center",
    width: "100%",
  },
  login: {
    margin: 0,
    fontSize: "0.85rem",
    color: C.accent,
    letterSpacing: "0.04em",
    fontWeight: 600,
  },
  name: {
    margin: "0.2rem 0 0",
    fontSize: "0.78rem",
    color: C.muted,
  },
  meta: {
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem",
    marginTop: "0.6rem",
    flexWrap: "wrap",
  },
  badge: {
    fontSize: "0.68rem",
    padding: "2px 8px",
    borderRadius: 20,
    background: C.surface,
    border: `1px solid ${C.border}`,
    color: C.muted,
    letterSpacing: "0.04em",
  },
  viewBtn: {
    marginTop: "0.5rem",
    width: "100%",
    padding: "0.55rem",
    borderRadius: 8,
    border: `1px solid ${C.accent2}55`,
    background: "transparent",
    color: C.accent2,
    fontSize: "0.78rem",
    letterSpacing: "0.06em",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modal: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    width: "100%",
    maxWidth: 460,
    overflow: "hidden",
    position: "relative",
    animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
  },
  modalBanner: {
    height: 80,
    background: `linear-gradient(135deg, ${C.accent2}55, ${C.accent}33)`,
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 14,
    background: "rgba(0,0,0,0.4)",
    border: "none",
    color: C.text,
    borderRadius: "50%",
    width: 30,
    height: 30,
    cursor: "pointer",
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    transition: "background 0.2s",
  },
  modalAvatar: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    border: `3px solid ${C.accent}`,
    objectFit: "cover",
    display: "block",
    margin: "-45px auto 0",
    boxShadow: `0 0 24px ${C.accent}55`,
  },
  modalContent: {
    padding: "1rem 1.75rem 1.75rem",
    textAlign: "center",
  },
  modalName: {
    margin: "0.75rem 0 0",
    fontSize: "1.2rem",
    fontWeight: 700,
    color: C.white,
  },
  modalLogin: {
    margin: "0.25rem 0 0",
    fontSize: "0.8rem",
    color: C.accent,
    letterSpacing: "0.06em",
  },
  bio: {
    fontSize: "0.82rem",
    color: C.muted,
    margin: "0.75rem 0 0",
    lineHeight: 1.6,
  },
  statsRow: {
    display: "flex",
    justifyContent: "space-around",
    margin: "1.25rem 0",
    padding: "1rem 0",
    borderTop: `1px solid ${C.border}`,
    borderBottom: `1px solid ${C.border}`,
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  statVal: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: C.white,
  },
  statLabel: {
    fontSize: "0.68rem",
    color: C.muted,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    marginBottom: "1.25rem",
    textAlign: "left",
  },
  infoItem: {
    fontSize: "0.8rem",
    color: C.muted,
  },
  link: {
    color: C.accent2,
    textDecoration: "none",
  },
  ghLink: {
    display: "inline-block",
    padding: "0.65rem 1.5rem",
    borderRadius: 10,
    background: `linear-gradient(135deg, ${C.accent2}, ${C.accent})`,
    color: C.bg,
    fontSize: "0.82rem",
    fontWeight: 700,
    textDecoration: "none",
    letterSpacing: "0.06em",
    transition: "opacity 0.2s ease, transform 0.2s ease",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.88); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 0.9; }
  }

  .skeleton { animation: pulse 1.4s ease infinite; }

  .card:hover {
    border-color: #7c6af755 !important;
    transform: translateY(-4px);
    transition: all 0.25s ease;
  }
  .card:hover img {
    transform: scale(1.06);
    border-color: #00ffe0 !important;
    box-shadow: 0 0 18px #00ffe0cc, 0 0 40px #00ffe077, 0 0 70px #00ffe044 !important;
  }

  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 10px #00ffe099, 0 0 22px #00ffe044, 0 0 38px #00ffe022; }
    50%       { box-shadow: 0 0 20px #00ffe0cc, 0 0 42px #00ffe077, 0 0 65px #00ffe044; }
  }
  .card img { animation: glowPulse 3s ease-in-out infinite; }

  .view-btn:hover {
    background: #7c6af722 !important;
    border-color: #7c6af7 !important;
  }

  .gh-link:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }
`;