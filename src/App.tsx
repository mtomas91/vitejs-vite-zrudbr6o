import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Home,
  Users,
  UserCircle,
  UserCheck,
  Globe,
  Plus,
  MessageCircle,
  Check,
  X,
  ShieldCheck,
  Lock,
  ChevronLeft,
  Camera,
  Send,
  Baby,
  Bell,
  MessagesSquare,
  Search,
  LogOut,
} from "lucide-react";

// ---------------------------------------------------------------------------
// NEST — conectado a Supabase (auth real, base de datos real, fotos reales)
// ---------------------------------------------------------------------------

const SUPABASE_URL = "https://ryupulkpmcygscnlkdwn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dXB1bGtwbWN5Z3NjbmxrZHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMDc5NTgsImV4cCI6MjA5OTg4Mzk1OH0.Z33G9uc42awpzTaZYQ-m__M5xioEwMAoy8fTztDbNOU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET = "nest-photos";

const PALETTE = {
  bgDeep: "#FFFFFF",
  bgPanel: "#F7F5F0",
  bgCard: "#EFEBE3",
  amber: "#C1873A",
  sage: "#5E8468",
  textPrimary: "#20242B",
  textMuted: "#767F8A",
  border: "rgba(32,36,43,0.09)",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');`;

const primaryBtnStyle = {
  width: "100%",
  background: PALETTE.amber,
  color: "#FFFFFF",
  border: "none",
  borderRadius: 14,
  padding: "15px 0",
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
};

const secondaryBtnStyle = {
  background: "transparent",
  border: `1px solid ${PALETTE.border}`,
  borderRadius: 12,
  padding: "12px 0",
  color: PALETTE.textMuted,
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  fontSize: 14,
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: PALETTE.bgCard,
  border: `1px solid ${PALETTE.border}`,
  borderRadius: 10,
  padding: "11px 12px",
  color: PALETTE.textPrimary,
  fontFamily: "'Inter', sans-serif",
  fontSize: 13.5,
  outline: "none",
};

// ---- pequeños componentes ---------------------------------------------------

function Avatar({ name, hue = PALETTE.amber, size = 44 }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Fraunces', serif",
        fontWeight: 600,
        fontSize: size * 0.4,
        color: "#FFFFFF",
        background: `linear-gradient(150deg, ${hue}, ${hue}cc)`,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

function Badge({ children, tone = "amber" }) {
  const color = tone === "amber" ? PALETTE.amber : PALETTE.sage;
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        color,
        border: `1px solid ${color}55`,
        borderRadius: 20,
        padding: "3px 8px",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {children}
    </span>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 20px 14px",
        position: "sticky",
        top: 0,
        background: `linear-gradient(${PALETTE.bgDeep} 80%, transparent)`,
        zIndex: 5,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", color: PALETTE.textPrimary, cursor: "pointer", padding: 4, display: "flex" }}>
            <ChevronLeft size={22} />
          </button>
        )}
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: PALETTE.textPrimary, margin: 0 }}>
          {title}
        </h1>
      </div>
      {right}
    </div>
  );
}

function VisibilityTag({ visibility }) {
  const map = {
    privado: { icon: Lock, label: "Solo yo", tone: PALETTE.textMuted },
    especifico: { icon: UserCheck, label: "Algunos", tone: PALETTE.amber },
    publico: { icon: Globe, label: "Círculo", tone: PALETTE.sage },
  };
  const v = map[visibility] || map.privado;
  const Icon = v.icon;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: v.tone }}>
      <Icon size={11} /> {v.label}
    </span>
  );
}

// ---- pantalla de autenticación ----------------------------------------------

function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login"); // login | signup | verificando
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else onAuthed();
  }

  async function handleSignupStart() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError("Completá nombre, email y una contraseña de al menos 6 caracteres.");
      return;
    }
    setError("");
    setMode("verificando");
  }

  async function completeSignup() {
    setError("");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    const userId = data.user?.id;
    if (userId) {
      await supabase.from("accounts").insert({ id: userId, name, email, verified: true });
      await supabase.from("profiles").insert({ owner_id: userId, name, tipo: "adulto", hue: "#C1873A", role: "Cuenta madre" });
    }
    setLoading(false);
    onAuthed();
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 32px", textAlign: "center", overflowY: "auto" }}>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 700, color: PALETTE.textPrimary, margin: "0 0 8px" }}>Nest</h1>
      <p style={{ color: PALETTE.textMuted, fontSize: 14, lineHeight: 1.6, margin: "0 0 28px" }}>
        Un lugar cerrado para guardar recuerdos con tu familia y tu círculo de siempre.
      </p>

      {mode === "login" && (
        <div style={{ width: "100%" }}>
          <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p style={{ color: "#b04545", fontSize: 12.5, marginBottom: 8 }}>{error}</p>}
          <button style={primaryBtnStyle} onClick={handleLogin} disabled={loading}>
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
          <button style={{ ...secondaryBtnStyle, width: "100%", marginTop: 8 }} onClick={() => { setMode("signup"); setError(""); }}>
            Crear cuenta madre nueva
          </button>
        </div>
      )}

      {mode === "signup" && (
        <div style={{ width: "100%" }}>
          <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Contraseña (mín. 6 caracteres)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p style={{ color: "#b04545", fontSize: 12.5, marginBottom: 8 }}>{error}</p>}
          <button style={primaryBtnStyle} onClick={handleSignupStart}>Continuar</button>
          <button style={{ ...secondaryBtnStyle, width: "100%", marginTop: 8 }} onClick={() => { setMode("login"); setError(""); }}>
            Ya tengo cuenta
          </button>
        </div>
      )}

      {mode === "verificando" && (
        <div style={{ width: "100%" }}>
          <div style={{ background: PALETTE.bgPanel, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: "22px 18px", marginBottom: 18, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <ShieldCheck size={18} color={PALETTE.sage} />
              <span style={{ color: PALETTE.textPrimary, fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Verificación de mayoría de edad</span>
            </div>
            <p style={{ color: PALETTE.textMuted, fontSize: 13, lineHeight: 1.5, margin: "0 0 16px" }}>
              Simulación del piloto: en producción esto conecta con un proveedor externo (DNI + selfie). Nest nunca guarda tu documento.
            </p>
            <div style={{ border: `1.5px dashed ${PALETTE.border}`, borderRadius: 12, padding: "18px 12px", textAlign: "center", color: PALETTE.textMuted, fontSize: 13 }}>
              <Camera size={20} style={{ marginBottom: 6 }} />
              <div>Simular carga de DNI</div>
            </div>
          </div>
          {error && <p style={{ color: "#b04545", fontSize: 12.5, marginBottom: 8 }}>{error}</p>}
          <button style={primaryBtnStyle} onClick={completeSignup} disabled={loading}>
            {loading ? "Creando cuenta..." : "Verificar y crear cuenta"}
          </button>
        </div>
      )}
    </div>
  );
}

// ---- pantalla de perfiles ----------------------------------------------------

function ProfilesScreen({ profiles, onOpenProfile, onCreateChild, onOpenNotifications, unreadCount, onLogout }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");

  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>
      <TopBar
        title="Tu Nest"
        right={
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={onOpenNotifications} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 4, color: PALETTE.textPrimary }}>
              <Bell size={21} />
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: 1, right: 1, width: 8, height: 8, borderRadius: "50%", background: PALETTE.amber, border: `1.5px solid ${PALETTE.bgDeep}` }} />
              )}
            </button>
            <button onClick={onLogout} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: PALETTE.textMuted }}>
              <LogOut size={19} />
            </button>
          </div>
        }
      />
      <div style={{ padding: "0 20px" }}>
        <p style={{ color: PALETTE.textMuted, fontSize: 13, lineHeight: 1.5, marginTop: -6, marginBottom: 20 }}>
          Perfiles bajo tu cuenta. Los perfiles administrados solo ven y comentan lo que vos autorizás.
        </p>

        {profiles.map((p) => (
          <button key={p.id} onClick={() => onOpenProfile(p.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, background: PALETTE.bgPanel, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: "14px 16px", marginBottom: 12, cursor: "pointer", textAlign: "left" }}>
            <Avatar name={p.name} hue={p.hue} size={48} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: PALETTE.textPrimary, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16 }}>{p.name}</span>
                {p.tipo === "hijo" && <Badge tone="sage">Administrado</Badge>}
              </div>
              <div style={{ color: PALETTE.textMuted, fontSize: 12.5, marginTop: 2 }}>{p.role}</div>
            </div>
          </button>
        ))}

        {!showCreate ? (
          <button onClick={() => setShowCreate(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", border: `1.5px dashed ${PALETTE.border}`, borderRadius: 16, padding: "16px", color: PALETTE.amber, fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 14, cursor: "pointer", marginTop: 4 }}>
            <Plus size={18} /> Crear perfil administrado
          </button>
        ) : (
          <div style={{ background: PALETTE.bgPanel, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Baby size={16} color={PALETTE.sage} />
              <span style={{ color: PALETTE.textPrimary, fontSize: 13.5, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Nuevo perfil administrado</span>
            </div>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre" style={inputStyle} />
            <input value={newAge} onChange={(e) => setNewAge(e.target.value)} placeholder="Edad" style={{ ...inputStyle, marginTop: 8 }} />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => { setShowCreate(false); setNewName(""); setNewAge(""); }} style={{ ...secondaryBtnStyle, flex: 1 }}>Cancelar</button>
              <button
                onClick={() => {
                  if (newName.trim()) {
                    onCreateChild(newName.trim(), newAge.trim());
                    setShowCreate(false); setNewName(""); setNewAge("");
                  }
                }}
                style={{ ...primaryBtnStyle, flex: 1, padding: "12px 0" }}
              >
                Crear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- pantalla de feed ---------------------------------------------------------

function FeedScreen({ profile, isOwner, circulo, onBack, myAccountId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPublish, setShowPublish] = useState(false);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [visibility, setVisibility] = useState("privado");
  const [sharedWith, setSharedWith] = useState([]);
  const [uploading, setUploading] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    const withUrlsAndComments = await Promise.all(
      (postsData || []).map(async (post) => {
        let imageUrl = null;
        if (post.image_url) {
          const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(post.image_url, 3600);
          imageUrl = signed?.signedUrl || null;
        }
        const { data: comments } = await supabase
          .from("comments")
          .select("*")
          .eq("post_id", post.id)
          .order("created_at", { ascending: true });
        return { ...post, imageUrl, comments: comments || [] };
      })
    );
    setPosts(withUrlsAndComments);
    setLoading(false);
  }, [profile.id]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  function resetForm() {
    setCaption(""); setFile(null); setVisibility("privado"); setSharedWith([]); setShowPublish(false);
  }

  function toggleShared(id) {
    setSharedWith((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handlePublish() {
    if (!caption.trim()) return;
    setUploading(true);
    let imagePath = null;
    if (file) {
      const path = `${myAccountId}/${profile.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
      if (!upErr) imagePath = path;
    }
    const { data: inserted, error } = await supabase
      .from("posts")
      .insert({ profile_id: profile.id, owner_id: myAccountId, caption: caption.trim(), image_url: imagePath, visibility })
      .select()
      .single();

    if (!error && inserted && visibility === "especifico" && sharedWith.length > 0) {
      await supabase.from("post_shares").insert(sharedWith.map((accountId) => ({ post_id: inserted.id, account_id: accountId })));
    }
    setUploading(false);
    resetForm();
    loadPosts();
  }

  async function addComment(postId, text) {
    if (!text.trim()) return;
    await supabase.from("comments").insert({ post_id: postId, author_id: myAccountId, author_name: "Vos", text: text.trim() });
    loadPosts();
  }

  const visOptions = [
    { id: "privado", label: "Solo para mí", desc: "Nadie más lo ve", icon: Lock },
    { id: "especifico", label: "Personas específicas", desc: "Elegís quién lo ve", icon: UserCheck },
    { id: "publico", label: "Todo mi círculo", desc: "Visible para tus contactos", icon: Globe },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>
      <TopBar title={profile.name} onBack={onBack} right={<Avatar name={profile.name} hue={profile.hue} size={34} />} />
      <div style={{ padding: "0 20px" }}>
        {!isOwner && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: PALETTE.textMuted, fontSize: 12, marginBottom: 16, marginTop: -6 }}>
            <Lock size={12} /> Perfil administrado — solo puede ver fotos autorizadas
          </div>
        )}

        {isOwner && (!showPublish ? (
          <button onClick={() => setShowPublish(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: `${PALETTE.amber}14`, border: `1.5px dashed ${PALETTE.amber}66`, borderRadius: 14, padding: "14px", color: PALETTE.amber, fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13.5, cursor: "pointer", marginBottom: 20 }}>
            <Plus size={17} /> Guardar un recuerdo
          </button>
        ) : (
          <div style={{ background: PALETTE.bgPanel, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <input type="file" accept="image/*" id="file-upload" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
            <label htmlFor="file-upload" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, border: `1.5px dashed ${PALETTE.border}`, borderRadius: 12, padding: "18px 12px", marginBottom: 10, cursor: "pointer", color: PALETTE.textMuted }}>
              <Camera size={20} />
              <span style={{ fontSize: 12.5, fontFamily: "'Inter', sans-serif" }}>{file ? file.name : "Elegir foto de tu galería"}</span>
            </label>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="¿Qué momento querés guardar?" style={inputStyle} />

            <div style={{ color: PALETTE.textMuted, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", margin: "16px 0 8px" }}>¿Quién puede verlo?</div>
            {visOptions.map((opt) => {
              const Icon = opt.icon;
              const active = visibility === opt.id;
              return (
                <button key={opt.id} onClick={() => setVisibility(opt.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: active ? `${PALETTE.amber}14` : "transparent", border: `1px solid ${active ? PALETTE.amber : PALETTE.border}`, borderRadius: 12, padding: "10px 12px", marginBottom: 8, cursor: "pointer", textAlign: "left" }}>
                  <Icon size={16} color={active ? PALETTE.amber : PALETTE.textMuted} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: PALETTE.textPrimary, fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{opt.label}</div>
                    <div style={{ color: PALETTE.textMuted, fontSize: 11 }}>{opt.desc}</div>
                  </div>
                </button>
              );
            })}

            {visibility === "especifico" && (
              <div style={{ background: PALETTE.bgCard, borderRadius: 12, padding: 10, marginTop: 4, marginBottom: 4 }}>
                {circulo.length === 0 ? (
                  <div style={{ color: PALETTE.textMuted, fontSize: 12, padding: "6px 4px" }}>Todavía no tenés a nadie en tu círculo.</div>
                ) : (
                  circulo.map((c) => {
                    const checked = sharedWith.includes(c.id);
                    return (
                      <button key={c.id} onClick={() => toggleShared(c.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", padding: "7px 4px", cursor: "pointer", textAlign: "left" }}>
                        <Avatar name={c.name} hue={PALETTE.sage} size={28} />
                        <span style={{ flex: 1, color: PALETTE.textPrimary, fontSize: 12.5, fontFamily: "'Inter', sans-serif" }}>{c.name}</span>
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${checked ? PALETTE.amber : PALETTE.border}`, background: checked ? PALETTE.amber : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {checked && <Check size={11} color="#FFFFFF" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={resetForm} style={{ ...secondaryBtnStyle, flex: 1 }}>Cancelar</button>
              <button onClick={handlePublish} disabled={uploading} style={{ ...primaryBtnStyle, flex: 1, padding: "12px 0" }}>
                {uploading ? "Subiendo..." : "Guardar"}
              </button>
            </div>
          </div>
        ))}

        {loading && <div style={{ textAlign: "center", color: PALETTE.textMuted, fontSize: 13, padding: 30 }}>Cargando recuerdos...</div>}
        {!loading && posts.length === 0 && (
          <div style={{ textAlign: "center", color: PALETTE.textMuted, fontSize: 13, padding: "40px 10px" }}>Todavía no hay recuerdos guardados acá.</div>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} onComment={(text) => addComment(post.id, text)} />
        ))}
      </div>
    </div>
  );
}

function PostCard({ post, onComment }) {
  const [text, setText] = useState("");
  return (
    <div style={{ background: PALETTE.bgPanel, border: `1px solid ${PALETTE.border}`, borderRadius: 12, padding: "16px 16px 14px", marginBottom: 18 }}>
      <div style={{ height: 190, borderRadius: 8, overflow: "hidden", background: "linear-gradient(160deg,#F0EBE0,#E4DDCF)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Camera size={32} color={PALETTE.textMuted} />
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
        <p style={{ color: PALETTE.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: 14, margin: 0, flex: 1 }}>{post.caption}</p>
        <VisibilityTag visibility={post.visibility} />
      </div>
      {post.comments?.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          {post.comments.map((c) => (
            <div key={c.id} style={{ fontSize: 12.5, color: PALETTE.textMuted, marginBottom: 4 }}>
              <span style={{ color: PALETTE.sage, fontWeight: 600 }}>{c.author_name}: </span>{c.text}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <MessageCircle size={15} color={PALETTE.textMuted} />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Comentar..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: PALETTE.textPrimary, fontSize: 12.5, fontFamily: "'Inter', sans-serif" }} />
        {text.trim() && (
          <button onClick={() => { onComment(text.trim()); setText(""); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: PALETTE.amber }}>
            <Send size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

// ---- círculo ------------------------------------------------------------------

function CirculoScreen({ myAccountId, circulo, solicitudes, onRefresh }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    const { data } = await supabase.from("accounts").select("id,name,email").ilike("email", `%${query.trim()}%`).neq("id", myAccountId).limit(5);
    setResults(data || []);
    setSearching(false);
  }

  async function sendInvite(targetId) {
    await supabase.from("follow_requests").insert({ from_id: myAccountId, to_id: targetId });
    setResults((prev) => prev.filter((r) => r.id !== targetId));
  }

  async function aceptar(reqId, fromId) {
    await supabase.from("follow_requests").update({ status: "aceptada" }).eq("id", reqId);
    await supabase.from("circle_connections").insert({ account_id: myAccountId, contact_id: fromId });
    onRefresh();
  }

  async function rechazar(reqId) {
    await supabase.from("follow_requests").update({ status: "rechazada" }).eq("id", reqId);
    onRefresh();
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>
      <TopBar title="Círculo" />
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por email para invitar..." style={{ ...inputStyle, flex: 1 }} />
          <button onClick={handleSearch} style={{ width: 42, borderRadius: 10, border: "none", background: PALETTE.amber, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Search size={16} />
          </button>
        </div>

        {searching && <div style={{ color: PALETTE.textMuted, fontSize: 12.5, marginBottom: 12 }}>Buscando...</div>}
        {results.map((r) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, background: PALETTE.bgPanel, border: `1px solid ${PALETTE.border}`, borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
            <Avatar name={r.name} size={34} />
            <span style={{ flex: 1, fontSize: 13, fontFamily: "'Inter', sans-serif", color: PALETTE.textPrimary }}>{r.name}</span>
            <button onClick={() => sendInvite(r.id)} style={{ ...secondaryBtnStyle, padding: "6px 12px", fontSize: 12 }}>Invitar</button>
          </div>
        ))}

        {solicitudes.length > 0 && (
          <>
            <div style={{ color: PALETTE.amber, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", marginBottom: 12 }}>Solicitudes pendientes</div>
            {solicitudes.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, background: PALETTE.bgPanel, border: `1px solid ${PALETTE.amber}33`, borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
                <Avatar name={s.fromName} hue={PALETTE.amber} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: PALETTE.textPrimary, fontSize: 13.5, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{s.fromName}</div>
                  <div style={{ color: PALETTE.textMuted, fontSize: 11.5 }}>{s.fromEmail}</div>
                </div>
                <button onClick={() => rechazar(s.id)} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${PALETTE.textMuted}55`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X size={15} color={PALETTE.textMuted} />
                </button>
                <button onClick={() => aceptar(s.id, s.fromId)} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${PALETTE.sage}88`, background: `${PALETTE.sage}22`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Check size={15} color={PALETTE.sage} />
                </button>
              </div>
            ))}
          </>
        )}

        <div style={{ color: PALETTE.sage, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", margin: "18px 0 12px" }}>Tu círculo ({circulo.length})</div>
        {circulo.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 4px", borderBottom: `1px solid ${PALETTE.border}` }}>
            <Avatar name={c.name} hue={PALETTE.sage} size={38} />
            <div style={{ color: PALETTE.textPrimary, fontSize: 13.5, fontFamily: "'Inter', sans-serif" }}>{c.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- chats --------------------------------------------------------------------

function ChatsScreen({ circulo, onOpenChat }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>
      <TopBar title="Chats" />
      <div style={{ padding: "0 20px" }}>
        {circulo.length === 0 && <div style={{ textAlign: "center", color: PALETTE.textMuted, fontSize: 13, padding: "40px 10px" }}>Todavía no tenés a nadie en tu círculo.</div>}
        {circulo.map((c) => (
          <button key={c.id} onClick={() => onOpenChat(c)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: PALETTE.bgPanel, border: `1px solid ${PALETTE.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 10, cursor: "pointer", textAlign: "left" }}>
            <Avatar name={c.name} hue={PALETTE.sage} size={42} />
            <div style={{ color: PALETTE.textPrimary, fontSize: 13.5, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{c.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatDetailScreen({ contact, myAccountId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(from_id.eq.${myAccountId},to_id.eq.${contact.id}),and(from_id.eq.${contact.id},to_id.eq.${myAccountId})`)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  }, [contact.id, myAccountId]);

  useEffect(() => { load(); }, [load]);

  async function send() {
    if (!text.trim()) return;
    await supabase.from("messages").insert({ from_id: myAccountId, to_id: contact.id, text: text.trim() });
    setText("");
    load();
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title={contact.name} onBack={onBack} right={<Avatar name={contact.name} hue={PALETTE.sage} size={32} />} />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
        {messages.length === 0 && <div style={{ textAlign: "center", color: PALETTE.textMuted, fontSize: 13, padding: "40px 10px" }}>Decí hola 👋</div>}
        {messages.map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.from_id === myAccountId ? "flex-end" : "flex-start", marginBottom: 8 }}>
            <div style={{ maxWidth: "75%", background: m.from_id === myAccountId ? PALETTE.amber : PALETTE.bgPanel, color: m.from_id === myAccountId ? "#FFFFFF" : PALETTE.textPrimary, border: m.from_id === myAccountId ? "none" : `1px solid ${PALETTE.border}`, borderRadius: 14, padding: "9px 12px", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 16px 18px", borderTop: `1px solid ${PALETTE.border}` }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribir un mensaje..." style={{ ...inputStyle, flex: 1 }} />
        {text.trim() && (
          <button onClick={send} style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: PALETTE.amber, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Send size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// ---- cuenta y nav ---------------------------------------------------------------

function CuentaScreen({ account, profiles }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>
      <TopBar title="Tu cuenta" />
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: PALETTE.bgPanel, border: `1px solid ${PALETTE.border}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <Avatar name={account?.name} size={52} />
          <div style={{ flex: 1 }}>
            <div style={{ color: PALETTE.textPrimary, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 17 }}>{account?.name}</div>
            <div style={{ color: PALETTE.textMuted, fontSize: 12 }}>{account?.email}</div>
            <div style={{ marginTop: 4 }}><Badge tone="sage"><ShieldCheck size={11} /> Verificada</Badge></div>
          </div>
        </div>
        <div style={{ color: PALETTE.textMuted, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", marginBottom: 10 }}>Perfiles administrados</div>
        {profiles.filter((p) => p.tipo === "hijo").map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, background: PALETTE.bgPanel, border: `1px solid ${PALETTE.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
            <Avatar name={p.name} hue={p.hue} size={38} />
            <div style={{ color: PALETTE.textPrimary, fontSize: 13.5, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { id: "perfiles", icon: Home, label: "Inicio" },
    { id: "chats", icon: MessagesSquare, label: "Chats" },
    { id: "circulo", icon: Users, label: "Círculo" },
    { id: "cuenta", icon: UserCircle, label: "Cuenta" },
  ];
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", background: PALETTE.bgPanel, borderTop: `1px solid ${PALETTE.border}`, padding: "10px 0 14px" }}>
      {items.map((it) => {
        const active = tab === it.id;
        const Icon = it.icon;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", color: active ? PALETTE.amber : PALETTE.textMuted }}>
            <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
            <span style={{ fontSize: 10.5, fontFamily: "'Inter', sans-serif", fontWeight: active ? 600 : 400 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---- app raíz -------------------------------------------------------------------

export default function NestApp() {
  const [session, setSession] = useState(undefined); // undefined = cargando, null = sin sesión
  const [account, setAccount] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [circulo, setCirculo] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [tab, setTab] = useState("perfiles");
  const [openProfileId, setOpenProfileId] = useState(null);
  const [openChatContact, setOpenChatContact] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadAll = useCallback(async () => {
    if (!session?.user) return;
    const uid = session.user.id;
    const { data: acc } = await supabase.from("accounts").select("*").eq("id", uid).single();
    setAccount(acc);

    const { data: profs } = await supabase.from("profiles").select("*").eq("owner_id", uid).order("created_at", { ascending: true });
    setProfiles(profs || []);

    const { data: conns } = await supabase.from("circle_connections").select("*").or(`account_id.eq.${uid},contact_id.eq.${uid}`);
    const otherIds = (conns || []).map((c) => (c.account_id === uid ? c.contact_id : c.account_id));
    if (otherIds.length > 0) {
      const { data: others } = await supabase.from("accounts").select("id,name,email").in("id", otherIds);
      setCirculo(others || []);
    } else {
      setCirculo([]);
    }

    const { data: reqs } = await supabase.from("follow_requests").select("*").eq("to_id", uid).eq("status", "pendiente");
    if (reqs && reqs.length > 0) {
      const fromIds = reqs.map((r) => r.from_id);
      const { data: senders } = await supabase.from("accounts").select("id,name,email").in("id", fromIds);
      const merged = reqs.map((r) => {
        const sender = senders?.find((s) => s.id === r.from_id);
        return { id: r.id, fromId: r.from_id, fromName: sender?.name || "?", fromEmail: sender?.email || "" };
      });
      setSolicitudes(merged);
    } else {
      setSolicitudes([]);
    }
  }, [session]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function createChild(name, age) {
    const hues = ["#7C9885", "#C98DA0", "#8FA6C9", "#C9A87C"];
    await supabase.from("profiles").insert({
      owner_id: session.user.id, name, tipo: "hijo",
      hue: hues[profiles.length % hues.length],
      role: age ? `Perfil administrado · ${age} años` : "Perfil administrado",
    });
    loadAll();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAccount(null); setProfiles([]); setCirculo([]); setSolicitudes([]);
  }

  const openProfile = profiles.find((p) => p.id === openProfileId);

  if (session === undefined) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: PALETTE.textMuted, fontSize: 13 }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#E7E2D8", fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ width: 400, height: 780, maxHeight: "94vh", background: PALETTE.bgDeep, borderRadius: 36, border: "6px solid #05070A", boxShadow: "0 30px 80px rgba(0,0,0,0.6)", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
        {!session ? (
          <AuthScreen onAuthed={() => {}} />
        ) : showNotifications ? (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <TopBar title="Solicitudes" onBack={() => setShowNotifications(false)} />
            <div style={{ padding: "0 20px" }}>
              {solicitudes.length === 0 && <div style={{ textAlign: "center", color: PALETTE.textMuted, fontSize: 13, padding: "40px 10px" }}>No tenés solicitudes pendientes.</div>}
              {solicitudes.map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, background: PALETTE.bgPanel, border: `1px solid ${PALETTE.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
                  <Avatar name={s.fromName} hue={PALETTE.amber} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: PALETTE.textPrimary, fontSize: 13.5, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{s.fromName}</div>
                    <div style={{ color: PALETTE.textMuted, fontSize: 11.5 }}>{s.fromEmail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : openChatContact ? (
          <ChatDetailScreen contact={openChatContact} myAccountId={session.user.id} onBack={() => setOpenChatContact(null)} />
        ) : openProfile ? (
          <FeedScreen
            profile={openProfile}
            isOwner={openProfile.tipo === "adulto"}
            circulo={circulo}
            myAccountId={session.user.id}
            onBack={() => setOpenProfileId(null)}
          />
        ) : (
          <>
            {tab === "perfiles" && (
              <ProfilesScreen
                profiles={profiles}
                onOpenProfile={setOpenProfileId}
                onCreateChild={createChild}
                onOpenNotifications={() => setShowNotifications(true)}
                unreadCount={solicitudes.length}
                onLogout={handleLogout}
              />
            )}
            {tab === "chats" && <ChatsScreen circulo={circulo} onOpenChat={setOpenChatContact} />}
            {tab === "circulo" && (
              <CirculoScreen myAccountId={session.user.id} circulo={circulo} solicitudes={solicitudes} onRefresh={loadAll} />
            )}
            {tab === "cuenta" && <CuentaScreen account={account} profiles={profiles} />}
            <BottomNav tab={tab} setTab={setTab} />
          </>
        )}
      </div>
    </div>
  );
}
