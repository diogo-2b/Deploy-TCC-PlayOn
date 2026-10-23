import { useEffect, useRef, useState } from "react";

const STEAM_STATES = {
  0: { label: "Offline", color: "bg-gray-500" },
  1: { label: "Online", color: "bg-green-400" },
  2: { label: "Ocupado", color: "bg-red-400" },
  3: { label: "Ausente", color: "bg-yellow-400" },
  4: { label: "Soneca", color: "bg-yellow-300" },
  5: { label: "Procurando troca", color: "bg-blue-400" },
  6: { label: "Procurando partida", color: "bg-blue-300" },
};

const SteamMiniProfile = ({ steam }) => {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef(null);
  const estado = STEAM_STATES[Number(steam?.personastate)] || {
    label: "Indisponível",
    color: "bg-gray-500",
  };

  useEffect(() => {
    if (!aberto) return undefined;

    const fecharAoClicarFora = (event) => {
      if (!containerRef.current?.contains(event.target)) setAberto(false);
    };

    document.addEventListener("pointerdown", fecharAoClicarFora);
    return () => document.removeEventListener("pointerdown", fecharAoClicarFora);
  }, [aberto]);

  if (!steam?.profile_url) return null;

  const alternarNoToque = (event) => {
    if (event.pointerType === "touch") {
      event.preventDefault();
      setAberto((atual) => !atual);
    }
  };

  return (
    <span
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
      onFocus={() => setAberto(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setAberto(false);
      }}
    >
      <a
        className="text-sm text-[#c09318] underline"
        href={steam.profile_url}
        target="_blank"
        rel="noreferrer"
        onPointerDown={alternarNoToque}
      >
        Abrir perfil Steam
      </a>

      {aberto && (
        <div
          role="dialog"
          aria-label={`Mini perfil Steam de ${steam.personaname || "usuário"}`}
          className="absolute left-0 top-full z-50 mt-3 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-[#3b4b5b] bg-[#171d25] text-white shadow-2xl ring-1 ring-black/50 sm:left-1/2 sm:-translate-x-1/2"
        >
          <div className="h-10 bg-gradient-to-r from-[#1b2838] via-[#2a475e] to-[#1b2838]" />
          <div className="-mt-8 flex items-start gap-3 px-4 pb-4">
            <img
              src={steam.avatar || "/imagens/foto.png"}
              alt=""
              className="h-20 w-20 shrink-0 rounded border-2 border-[#66c0f4] bg-[#1b2838] object-cover shadow-lg"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/imagens/foto.png";
              }}
            />
            <div className="min-w-0 pt-9">
              <p className="truncate text-base font-semibold text-[#66c0f4]">
                {steam.personaname || "Nome indisponível"}
              </p>
              <p className="mt-1 flex items-center gap-2 text-xs text-gray-300">
                <span className={`h-2 w-2 rounded-full ${estado.color}`} />
                {estado.label}
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 bg-black/20 px-4 py-3">
            <a
              href={steam.profile_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-300 underline transition hover:text-white"
            >
              Abrir perfil completo
            </a>
          </div>
        </div>
      )}
    </span>
  );
};

export default SteamMiniProfile;
