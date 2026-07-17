import { useState } from "react";
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
  Settings2,
  Image as ImageIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// PICVAULT — piloto funcional
// Concepto: álbum familiar privado. Cuenta madre (adulto verificado) crea y
// administra perfiles de menores (solo lectura + comentarios autorizados).
// No hay likes. No hay perfiles públicos salvo marcas/famosos verificados.
// ---------------------------------------------------------------------------

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

// ---- mock data -------------------------------------------------------------

const INITIAL_PROFILES = [
  {
    id: "madre",
    name: "Valentina Ríos",
    role: "Cuenta madre",
    tipo: "adulto",
    hue: "#E3A052",
    posts: [
      {
        id: "p1",
        caption: "Domingo de asado en lo de mis viejos",
        fecha: "12 jul",
        emoji: "🍖",
        comments: [{ author: "Mateo", text: "¡Quiero ir la próxima!" }],
        visibility: "publico",
        sharedWith: [],
      },
      {
        id: "p2",
        caption: "Atardecer en Tigre, como todos los jueves",
        fecha: "3 jul",
        emoji: "🌇",
        comments: [],
        visibility: "privado",
        sharedWith: [],
      },
    ],
  },
  {
    id: "mateo",
    name: "Mateo",
    role: "Perfil administrado · 8 años",
    tipo: "hijo",
    hue: "#7C9885",
    posts: [
      {
        id: "p3",
        caption: "Mi dibujo de dinosaurios",
        fecha: "10 jul",
        emoji: "🦕",
        comments: [{ author: "Valentina Ríos", text: "¡Me encanta, campeón!" }],
        visibility: "publico",
        sharedWith: [],
      },
    ],
  },
  {
    id: "sofia",
    name: "Sofía",
    role: "Perfil administrado · 14 años",
    tipo: "hijo",
    hue: "#C98DA0",
    posts: [
      {
        id: "p4",
        caption: "Primer gol del torneo ⚽",
        fecha: "8 jul",
        emoji: "⚽",
        comments: [],
        visibility: "especifico",
        sharedWith: ["c1"],
      },
      {
        id: "p5",
        caption: "Con las amigas después del cole",
        fecha: "5 jul",
        emoji: "🎒",
        comments: [{ author: "Tía Carla", text: "Qué lindas todas!" }],
        visibility: "publico",
        sharedWith: [],
      },
    ],
  },
];

const INITIAL_CIRCULO = [
  { id: "c1", name: "Tía Carla", parentesco: "Familia" },
  { id: "c2", name: "Abuela Nora", parentesco: "Familia" },
  { id: "c3", name: "Fede (papá de Mateo)", parentesco: "Familia" },
];

const INITIAL_SOLICITUDES = [
  { id: "s1", name: "Julieta Gómez", detalle: "Amiga de Sofía · verificada" },
  { id: "s2", name: "Nico Ríos", detalle: "Primo · verificado" },
];

// ---- pequeños componentes ---------------------------------------------------

function TornEdge() {
  return (
    <div
      style={{
        position: "absolute",
        top: -6,
        left: "50%",
        transform: "translateX(-50%) rotate(-3deg)",
        width: 46,
        height: 16,
        background: "rgba(227,160,82,0.35)",
        borderRadius: 2,
      }}
    />
  );
}

function Avatar({ name, hue = PALETTE.amber, size = 44, ring = true }) {
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
        boxShadow: ring ? `0 0 0 3px ${PALETTE.bgDeep}, 0 0 0 4.5px ${hue}55` : "none",
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
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: PALETTE.textPrimary,
              cursor: "pointer",
              padding: 4,
              display: "flex",
            }}
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            fontSize: 22,
            color: PALETTE.textPrimary,
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>
      {right}
    </div>
  );
}

// ---- pantallas ---------------------------------------------------------------

function LoginScreen({ onLogin }) {
  const [step, setStep] = useState("intro"); // intro -> verificando -> ok
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 32px",
        textAlign: "center",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: 20,
          background: `radial-gradient(circle at 35% 30%, ${PALETTE.amber}, #8a5a22)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 22,
          boxShadow: `0 0 40px ${PALETTE.amber}33`,
          position: "relative",
        }}
      >
        <ImageIcon size={26} color="#3A2A12" />
        <div
          style={{
            position: "absolute",
            bottom: -6,
            right: -6,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: PALETTE.bgDeep,
            border: `2px solid ${PALETTE.amber}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Lock size={11} color={PALETTE.amber} />
        </div>
      </div>
      <h1
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 34,
          fontWeight: 700,
          color: PALETTE.textPrimary,
          margin: "0 0 8px",
        }}
      >
        PicVault
      </h1>
      <p style={{ color: PALETTE.textMuted, fontSize: 14.5, lineHeight: 1.6, margin: "0 0 36px" }}>
        Un lugar cerrado para guardar recuerdos con tu familia y tu círculo de siempre.
        Nadie te ve sin que vos lo decidas.
      </p>

      {step === "intro" && (
        <button
          onClick={() => setStep("verificando")}
          style={primaryBtnStyle}
        >
          Crear cuenta madre
        </button>
      )}

      {step === "verificando" && (
        <div style={{ width: "100%" }}>
          <div
            style={{
              background: PALETTE.bgPanel,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: 16,
              padding: "22px 18px",
              marginBottom: 18,
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <ShieldCheck size={18} color={PALETTE.sage} />
              <span style={{ color: PALETTE.textPrimary, fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                Verificación de mayoría de edad
              </span>
            </div>
            <p style={{ color: PALETTE.textMuted, fontSize: 13, lineHeight: 1.5, margin: "0 0 16px" }}>
              Simulación del piloto: en producción esto conecta con un proveedor
              externo (DNI + selfie). Nido nunca guarda tu documento — solo recibe
              la confirmación de que sos mayor de 18.
            </p>
            <div
              style={{
                border: `1.5px dashed ${PALETTE.border}`,
                borderRadius: 12,
                padding: "18px 12px",
                textAlign: "center",
                color: PALETTE.textMuted,
                fontSize: 13,
              }}
            >
              <Camera size={20} style={{ marginBottom: 6 }} />
              <div>Simular carga de DNI</div>
            </div>
          </div>
          <button onClick={() => setStep("ok")} style={primaryBtnStyle}>
            Verificar identidad
          </button>
        </div>
      )}

      {step === "ok" && (
        <div style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: `${PALETTE.sage}1a`,
              border: `1px solid ${PALETTE.sage}55`,
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 20,
              textAlign: "left",
            }}
          >
            <Check size={18} color={PALETTE.sage} />
            <span style={{ color: PALETTE.textPrimary, fontSize: 13.5, fontFamily: "'Inter', sans-serif" }}>
              Identidad verificada. Ya podés crear perfiles para tu familia.
            </span>
          </div>
          <button onClick={onLogin} style={primaryBtnStyle}>
            Entrar a mi Nido
          </button>
        </div>
      )}
    </div>
  );
}

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

function ProfilesScreen({ profiles, onOpenProfile, onCreateChild }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("");

  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>
      <TopBar title="Tu PicVault" />
      <div style={{ padding: "0 20px" }}>
        <p style={{ color: PALETTE.textMuted, fontSize: 13, lineHeight: 1.5, marginTop: -6, marginBottom: 20 }}>
          Perfiles bajo tu cuenta. Los perfiles administrados solo ven y comentan
          lo que vos autorizás.
        </p>

        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => onOpenProfile(p.id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: PALETTE.bgPanel,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: 16,
              padding: "14px 16px",
              marginBottom: 12,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <Avatar name={p.name} hue={p.hue} size={48} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: PALETTE.textPrimary, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16 }}>
                  {p.name}
                </span>
                {p.tipo === "hijo" && <Badge tone="sage">Administrado</Badge>}
              </div>
              <div style={{ color: PALETTE.textMuted, fontSize: 12.5, marginTop: 2 }}>{p.role}</div>
            </div>
            <div style={{ color: PALETTE.textMuted, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
              {p.posts.length} rec.
            </div>
          </button>
        ))}

        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "transparent",
              border: `1.5px dashed ${PALETTE.border}`,
              borderRadius: 16,
              padding: "16px",
              color: PALETTE.amber,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
              marginTop: 4,
            }}
          >
            <Plus size={18} /> Crear perfil administrado
          </button>
        ) : (
          <div
            style={{
              background: PALETTE.bgPanel,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Baby size={16} color={PALETTE.sage} />
              <span style={{ color: PALETTE.textPrimary, fontSize: 13.5, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                Nuevo perfil administrado
              </span>
            </div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre"
              style={inputStyle}
            />
            <input
              value={newAge}
              onChange={(e) => setNewAge(e.target.value)}
              placeholder="Edad"
              style={{ ...inputStyle, marginTop: 8 }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setNewName("");
                  setNewAge("");
                }}
                style={{ ...secondaryBtnStyle, flex: 1 }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (newName.trim()) {
                    onCreateChild(newName.trim(), newAge.trim());
                    setShowCreate(false);
                    setNewName("");
                    setNewAge("");
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

function VisibilityTag({ post, iconOnly }) {
  const map = {
    privado: { icon: Lock, label: "Solo yo", tone: PALETTE.textMuted },
    especifico: { icon: UserCheck, label: `${post.sharedWith?.length || 0} personas`, tone: PALETTE.amber },
    publico: { icon: Globe, label: "Círculo", tone: PALETTE.sage },
  };
  const v = map[post.visibility] || map.privado;
  const Icon = v.icon;

  if (iconOnly) {
    return (
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        }}
      >
        <Icon size={9} color={v.tone} />
      </div>
    );
  }

  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10.5,
        fontFamily: "'JetBrains Mono', monospace",
        color: v.tone,
      }}
    >
      <Icon size={11} />
      {v.label}
    </span>
  );
}

function PostCard({ post, onComment }) {
  const [text, setText] = useState("");
  return (
    <div
      style={{
        position: "relative",
        background: PALETTE.bgPanel,
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 4,
        padding: "16px 16px 14px",
        marginBottom: 22,
        boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
      }}
    >
      <TornEdge />
      <div
        style={{
          height: 190,
          borderRadius: 3,
          background: "linear-gradient(160deg,#F0EBE0,#E4DDCF)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          marginBottom: 12,
        }}
      >
        {post.emoji}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
        <p style={{ color: PALETTE.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: 14, margin: 0, flex: 1 }}>
          {post.caption}
        </p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <span style={{ color: PALETTE.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5 }}>
            {post.fecha}
          </span>
          <VisibilityTag post={post} />
        </div>
      </div>

      {post.comments.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          {post.comments.map((c, i) => (
            <div key={i} style={{ fontSize: 12.5, color: PALETTE.textMuted, marginBottom: 4 }}>
              <span style={{ color: PALETTE.sage, fontWeight: 600 }}>{c.author}: </span>
              {c.text}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <MessageCircle size={15} color={PALETTE.textMuted} />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Comentar..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: PALETTE.textPrimary,
            fontSize: 12.5,
            fontFamily: "'Inter', sans-serif",
          }}
        />
        {text.trim() && (
          <button
            onClick={() => {
              onComment(text.trim());
              setText("");
            }}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: PALETTE.amber }}
          >
            <Send size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

function FeedScreen({ profile, circulo, onBack, onAddComment, onPublish }) {
  const [showPublish, setShowPublish] = useState(false);
  const [caption, setCaption] = useState("");
  const emojis = ["📷", "🌳", "🎂", "🏖️", "🎨", "⚽"];
  const [emoji, setEmoji] = useState(emojis[0]);
  const [visibility, setVisibility] = useState("privado");
  const [sharedWith, setSharedWith] = useState([]);

  const visOptions = [
    { id: "privado", label: "Solo para mí", desc: "Nadie más lo ve", icon: Lock },
    { id: "especifico", label: "Personas específicas", desc: "Elegís quién lo ve", icon: UserCheck },
    { id: "publico", label: "Todo mi círculo", desc: "Visible para todos tus contactos aceptados", icon: Globe },
  ];

  function toggleShared(id) {
    setSharedWith((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function resetForm() {
    setCaption("");
    setVisibility("privado");
    setSharedWith([]);
    setShowPublish(false);
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>
      <TopBar
        title={profile.name}
        onBack={onBack}
        right={<Avatar name={profile.name} hue={profile.hue} size={34} />}
      />
      <div style={{ padding: "0 20px" }}>
        {profile.tipo === "hijo" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: PALETTE.textMuted,
              fontSize: 12,
              marginBottom: 16,
              marginTop: -6,
            }}
          >
            <Lock size={12} />
            Perfil administrado — solo puede ver fotos de contactos autorizados
          </div>
        )}

        {profile.tipo === "adulto" && (!showPublish ? (
          <button
            onClick={() => setShowPublish(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: `${PALETTE.amber}14`,
              border: `1.5px dashed ${PALETTE.amber}66`,
              borderRadius: 14,
              padding: "14px",
              color: PALETTE.amber,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: 13.5,
              cursor: "pointer",
              marginBottom: 20,
            }}
          >
            <Plus size={17} /> Guardar un recuerdo
          </button>
        ) : (
          <div
            style={{
              background: PALETTE.bgPanel,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {emojis.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: `1px solid ${emoji === e ? PALETTE.amber : PALETTE.border}`,
                    background: emoji === e ? `${PALETTE.amber}22` : "transparent",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="¿Qué momento querés guardar?"
              style={inputStyle}
            />

            <div style={{ color: PALETTE.textMuted, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5, margin: "16px 0 8px" }}>
              ¿Quién puede verlo?
            </div>
            {visOptions.map((opt) => {
              const Icon = opt.icon;
              const active = visibility === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setVisibility(opt.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: active ? `${PALETTE.amber}14` : "transparent",
                    border: `1px solid ${active ? PALETTE.amber : PALETTE.border}`,
                    borderRadius: 12,
                    padding: "10px 12px",
                    marginBottom: 8,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Icon size={16} color={active ? PALETTE.amber : PALETTE.textMuted} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: PALETTE.textPrimary, fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                      {opt.label}
                    </div>
                    <div style={{ color: PALETTE.textMuted, fontSize: 11 }}>{opt.desc}</div>
                  </div>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: `1.5px solid ${active ? PALETTE.amber : PALETTE.border}`,
                      background: active ? PALETTE.amber : "transparent",
                      flexShrink: 0,
                    }}
                  />
                </button>
              );
            })}

            {visibility === "especifico" && (
              <div
                style={{
                  background: PALETTE.bgCard,
                  borderRadius: 12,
                  padding: 10,
                  marginTop: 4,
                  marginBottom: 4,
                }}
              >
                {circulo.length === 0 ? (
                  <div style={{ color: PALETTE.textMuted, fontSize: 12, padding: "6px 4px" }}>
                    Todavía no tenés a nadie en tu círculo.
                  </div>
                ) : (
                  circulo.map((c) => {
                    const checked = sharedWith.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleShared(c.id)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          background: "transparent",
                          border: "none",
                          padding: "7px 4px",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <Avatar name={c.name} hue={PALETTE.sage} size={28} ring={false} />
                        <span style={{ flex: 1, color: PALETTE.textPrimary, fontSize: 12.5, fontFamily: "'Inter', sans-serif" }}>
                          {c.name}
                        </span>
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: `1.5px solid ${checked ? PALETTE.amber : PALETTE.border}`,
                            background: checked ? PALETTE.amber : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {checked && <Check size={11} color="#FFFFFF" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={resetForm} style={{ ...secondaryBtnStyle, flex: 1 }}>
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (caption.trim()) {
                    onPublish(caption.trim(), emoji, visibility, sharedWith);
                    resetForm();
                  }
                }}
                style={{ ...primaryBtnStyle, flex: 1, padding: "12px 0" }}
              >
                Guardar
              </button>
            </div>
          </div>
        ))}

        {profile.posts.length === 0 && (
          <div style={{ textAlign: "center", color: PALETTE.textMuted, fontSize: 13, padding: "40px 10px" }}>
            Todavía no hay recuerdos guardados acá.
          </div>
        )}

        {profile.posts.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                margin: "4px 0 10px",
              }}
            >
              <span
                style={{
                  color: PALETTE.textMuted,
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Tu Vault · {profile.posts.length} recuerdos
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 6,
                marginBottom: 22,
              }}
            >
              {profile.posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    position: "relative",
                    aspectRatio: "1 / 1",
                    borderRadius: 8,
                    background: "linear-gradient(160deg,#F0EBE0,#E4DDCF)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {post.emoji}
                  <div style={{ position: "absolute", bottom: 3, right: 3 }}>
                    <VisibilityTag post={post} iconOnly />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {profile.posts.map((post) => (
          <PostCard key={post.id} post={post} onComment={(text) => onAddComment(post.id, text)} />
        ))}
      </div>
    </div>
  );
}

function CirculoScreen({ circulo, solicitudes, onAceptar, onRechazar }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>
      <TopBar title="Círculo" />
      <div style={{ padding: "0 20px" }}>
        <p style={{ color: PALETTE.textMuted, fontSize: 13, lineHeight: 1.5, marginTop: -6, marginBottom: 22 }}>
          Nadie entra sin invitación aceptada. Vos administrás quién puede ver
          los perfiles de tu PicVault.
        </p>

        {solicitudes.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <span style={{ color: PALETTE.amber, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Solicitudes pendientes
              </span>
            </div>
            {solicitudes.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: PALETTE.bgPanel,
                  border: `1px solid ${PALETTE.amber}33`,
                  borderRadius: 14,
                  padding: "12px 14px",
                  marginBottom: 10,
                }}
              >
                <Avatar name={s.name} hue={PALETTE.amber} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: PALETTE.textPrimary, fontSize: 13.5, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                    {s.name}
                  </div>
                  <div style={{ color: PALETTE.textMuted, fontSize: 11.5 }}>{s.detalle}</div>
                </div>
                <button
                  onClick={() => onRechazar(s.id)}
                  style={{ ...iconBtnStyle, borderColor: `${PALETTE.textMuted}55` }}
                >
                  <X size={15} color={PALETTE.textMuted} />
                </button>
                <button
                  onClick={() => onAceptar(s.id)}
                  style={{ ...iconBtnStyle, borderColor: `${PALETTE.sage}88`, background: `${PALETTE.sage}22` }}
                >
                  <Check size={15} color={PALETTE.sage} />
                </button>
              </div>
            ))}
          </>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "18px 0 12px" }}>
          <span style={{ color: PALETTE.sage, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Tu círculo ({circulo.length})
          </span>
        </div>
        {circulo.map((c) => (
          <div
            key={c.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 4px",
              borderBottom: `1px solid ${PALETTE.border}`,
            }}
          >
            <Avatar name={c.name} hue={PALETTE.sage} size={38} />
            <div>
              <div style={{ color: PALETTE.textPrimary, fontSize: 13.5, fontFamily: "'Inter', sans-serif" }}>{c.name}</div>
              <div style={{ color: PALETTE.textMuted, fontSize: 11.5 }}>{c.parentesco}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const iconBtnStyle = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "1px solid",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0,
};

function CuentaScreen({ profiles }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>
      <TopBar title="Tu cuenta" />
      <div style={{ padding: "0 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: PALETTE.bgPanel,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <Avatar name="Valentina Ríos" size={52} />
          <div style={{ flex: 1 }}>
            <div style={{ color: PALETTE.textPrimary, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 17 }}>
              Valentina Ríos
            </div>
            <div style={{ marginTop: 4 }}>
              <Badge tone="sage">
                <ShieldCheck size={11} /> Verificada
              </Badge>
            </div>
          </div>
        </div>

        <div style={{ color: PALETTE.textMuted, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
          Permisos de perfiles administrados
        </div>
        {profiles
          .filter((p) => p.tipo === "hijo")
          .map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: PALETTE.bgPanel,
                border: `1px solid ${PALETTE.border}`,
                borderRadius: 14,
                padding: "12px 14px",
                marginBottom: 10,
              }}
            >
              <Avatar name={p.name} hue={p.hue} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ color: PALETTE.textPrimary, fontSize: 13.5, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                  {p.name}
                </div>
                <div style={{ color: PALETTE.textMuted, fontSize: 11.5 }}>Ver contenido autorizado + comentar</div>
              </div>
              <Settings2 size={16} color={PALETTE.textMuted} />
            </div>
          ))}

        <div
          style={{
            marginTop: 24,
            padding: "14px 16px",
            borderRadius: 14,
            background: `${PALETTE.amber}0f`,
            border: `1px solid ${PALETTE.amber}33`,
            color: PALETTE.textMuted,
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          Plan piloto · $1/mes por cuenta familiar. Las cuentas de empresas y
          figuras públicas verificadas se administran aparte, con perfil visible
          a todo PicVault.
        </div>
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { id: "perfiles", icon: Home, label: "Inicio" },
    { id: "circulo", icon: Users, label: "Círculo" },
    { id: "cuenta", icon: UserCircle, label: "Cuenta" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        background: PALETTE.bgPanel,
        borderTop: `1px solid ${PALETTE.border}`,
        padding: "10px 0 14px",
      }}
    >
      {items.map((it) => {
        const active = tab === it.id;
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              color: active ? PALETTE.amber : PALETTE.textMuted,
            }}
          >
            <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
            <span style={{ fontSize: 10.5, fontFamily: "'Inter', sans-serif", fontWeight: active ? 600 : 400 }}>
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---- app raíz ------------------------------------------------------------

export default function PicVaultPiloto() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState("perfiles");
  const [openProfileId, setOpenProfileId] = useState(null);
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [circulo, setCirculo] = useState(INITIAL_CIRCULO);
  const [solicitudes, setSolicitudes] = useState(INITIAL_SOLICITUDES);

  const openProfile = profiles.find((p) => p.id === openProfileId);

  function addComment(postId, text) {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id !== openProfileId
          ? p
          : {
              ...p,
              posts: p.posts.map((post) =>
                post.id !== postId
                  ? post
                  : { ...post, comments: [...post.comments, { author: "Vos", text }] }
              ),
            }
      )
    );
  }

  function publishPost(caption, emoji, visibility, sharedWith) {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id !== openProfileId
          ? p
          : {
              ...p,
              posts: [
                {
                  id: `p${Date.now()}`,
                  caption,
                  emoji,
                  fecha: "ahora",
                  comments: [],
                  visibility,
                  sharedWith,
                },
                ...p.posts,
              ],
            }
      )
    );
  }

  function createChild(name, age) {
    const hues = ["#7C9885", "#C98DA0", "#8FA6C9", "#C9A87C"];
    setProfiles((prev) => [
      ...prev,
      {
        id: `child-${Date.now()}`,
        name,
        role: age ? `Perfil administrado · ${age} años` : "Perfil administrado",
        tipo: "hijo",
        hue: hues[prev.length % hues.length],
        posts: [],
      },
    ]);
  }

  function aceptarSolicitud(id) {
    const s = solicitudes.find((x) => x.id === id);
    if (s) {
      setCirculo((prev) => [...prev, { id: s.id, name: s.name, parentesco: "Círculo" }]);
      setSolicitudes((prev) => prev.filter((x) => x.id !== id));
    }
  }

  function rechazarSolicitud(id) {
    setSolicitudes((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#E7E2D8",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{FONT_IMPORT}</style>
      <div
        style={{
          width: 400,
          height: 780,
          maxHeight: "94vh",
          background: PALETTE.bgDeep,
          borderRadius: 36,
          border: "6px solid #05070A",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!loggedIn ? (
          <LoginScreen onLogin={() => setLoggedIn(true)} />
        ) : openProfile ? (
          <FeedScreen
            profile={openProfile}
            circulo={circulo}
            onBack={() => setOpenProfileId(null)}
            onAddComment={addComment}
            onPublish={publishPost}
          />
        ) : (
          <>
            {tab === "perfiles" && (
              <ProfilesScreen
                profiles={profiles}
                onOpenProfile={setOpenProfileId}
                onCreateChild={createChild}
              />
            )}
            {tab === "circulo" && (
              <CirculoScreen
                circulo={circulo}
                solicitudes={solicitudes}
                onAceptar={aceptarSolicitud}
                onRechazar={rechazarSolicitud}
              />
            )}
            {tab === "cuenta" && <CuentaScreen profiles={profiles} />}
            <BottomNav tab={tab} setTab={setTab} />
          </>
        )}
      </div>
    </div>
  );
}
