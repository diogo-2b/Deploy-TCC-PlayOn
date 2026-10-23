import { useEffect, useState } from "react";
import axiosClient from "../../utils/axios-client";

const formatMinutes = (minutes) => {
  const totalMinutes = Number(minutes) || 0;
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
};

const RecentSteamGames = ({ usuarioId, hasSteam }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(Boolean(hasSteam));
  const [error, setError] = useState("");

  const buscarCapaIgdb = async (game) => {
    if (!game.image_fallback_attempted) {
      try {
        const response = await axiosClient.get("/jogos/capa", {
          params: { search: game.name },
        });
        const capa = response.data?.capa_url || null;
        setGames((atual) =>
          atual.map((item) =>
            item.appid === game.appid
              ? { ...item, image_url: capa, image_fallback_attempted: true }
              : item,
          ),
        );
      } catch {
        setGames((atual) =>
          atual.map((item) =>
            item.appid === game.appid
              ? { ...item, image_url: null, image_fallback_attempted: true }
              : item,
          ),
        );
      }
    }
  };

  useEffect(() => {
    if (!hasSteam || !usuarioId) {
      setLoading(false);
      setGames([]);
      return undefined;
    }

    let ativo = true;
    setLoading(true);
    setError("");

    axiosClient
      .get(`/usuarios/${usuarioId}/steam/recentes`)
      .then((response) => {
        if (!ativo) return;
        setGames(Array.isArray(response.data?.games) ? response.data.games : []);
      })
      .catch((requestError) => {
        if (!ativo) return;
        setGames([]);
        setError(
          requestError?.response?.data?.message ||
            "Não foi possível carregar os jogos recentes da Steam.",
        );
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, [hasSteam, usuarioId]);

  if (!hasSteam) return null;

  return (
    <>
      <h3 className="mb-4 mt-6 border-t border-white/10 pt-5 text-lg font-semibold text-[#c09318]">
        Jogados recentemente
      </h3>

      {loading && (
        <p className="text-sm text-gray-300">
          Carregando jogos recentes...
        </p>
      )}

      {!loading && error && <p className="text-sm text-red-300">{error}</p>}

      {!loading && !error && games.length === 0 && (
        <p className="text-sm text-gray-300">
          Nenhum jogo recente disponível. A conta pode estar privada ou não ter
          jogos nas últimas duas semanas.
        </p>
      )}

      {!loading && !error && games.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <article
              key={game.appid}
              className="overflow-hidden rounded-md border border-[#3b4b5b] bg-[#171d25] shadow-lg"
            >
              <img
                src={game.image_url || "/imagens/foto.png"}
                alt=""
                className="aspect-[460/215] w-full object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  if (!game.image_fallback_attempted) {
                    buscarCapaIgdb(game);
                  } else {
                    event.currentTarget.src = "/imagens/foto.png";
                  }
                }}
              />
              <div className="p-3">
                <h3 className="truncate font-semibold text-white">
                  {game.name || "Jogo sem nome"}
                </h3>
                <p className="mt-2 text-xs text-gray-300">
                  Total jogado: {formatMinutes(game.playtime_forever)}
                </p>
                {game.playtime_2weeks !== null &&
                  game.playtime_2weeks !== undefined && (
                    <p className="text-xs text-[#66c0f4]">
                      Últimas 2 semanas: {formatMinutes(game.playtime_2weeks)}
                    </p>
                  )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
};

export default RecentSteamGames;
