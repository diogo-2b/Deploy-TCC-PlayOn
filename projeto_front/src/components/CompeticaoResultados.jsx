import { useCallback, useEffect, useMemo, useState } from "react";
import axiosClient from "../utils/axios-client";

const faseLabels = {
  oitavas: "Oitavas de final",
  quartas: "Quartas de final",
  semifinais: "Semifinais",
  final: "Final",
  terceiro_lugar: "Disputa de terceiro lugar",
  rodada: "Rodada",
};

const lugares = [
  ["primeiro_lugar_id", "primeiro_lugar", "1º lugar"],
  ["segundo_lugar_id", "segundo_lugar", "2º lugar"],
  ["terceiro_lugar_id", "terceiro_lugar", "3º lugar"],
];

const CompeticaoResultados = ({ competicao, participantes, organizador }) => {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [resultados, setResultados] = useState({});
  const [rodada, setRodada] = useState("1");
  const [participanteA, setParticipanteA] = useState("");
  const [participanteB, setParticipanteB] = useState("");
  const [podio, setPodio] = useState({});

  const base = `/competicoes/${competicao.id ?? competicao.codigo}`;
  const buscarResultados = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const response = await axiosClient.get(`${base}/resultados`);
      setDados(response.data);
      setPodio(Object.fromEntries(lugares.map(([field, key]) => [field, response.data.podio?.[key]?.id ?? ""])));
      return true;
    } catch (error) {
      setErro(error?.response?.data?.message || "Não foi possível carregar os resultados.");
      return false;
    } finally {
      setCarregando(false);
    }
  }, [base]);

  useEffect(() => {
    buscarResultados();
  }, [buscarResultados]);

  const aprovados = useMemo(
    () => (participantes || []).filter((participante) => participante.aprovado),
    [participantes],
  );
  const formato = competicao.formato || dados?.configuracao?.formato;
  const estruturada = competicao.modo === "estruturado";
  const mataMata = formato?.startsWith("mata_mata_");
  const podeEditarResultados = organizador && !competicao.encerrada;

  const requisitar = async (acao) => {
    setSalvando(true);
    setErro("");
    setMensagem("");
    try {
      await acao();
      setResultados({});
      if (await buscarResultados()) setMensagem("Resultado atualizado.");
    } catch (error) {
      const validationErrors = error?.response?.data?.errors;
      setErro(
        (validationErrors && Object.values(validationErrors).flat().join(" ")) ||
          error?.response?.data?.message ||
          "Não foi possível atualizar os resultados.",
      );
    } finally {
      setSalvando(false);
    }
  };

  const nomeParticipante = (participante) =>
    participante?.participante?.apelido ||
    participante?.participante?.nome ||
    participante?.equipe?.nome ||
    `${participante?.tipo_participante === "equipe" ? "Equipe" : "Participante"} ${participante?.id_participante}`;

  const nomeResultado = (partida, resultado) => {
    if (resultado === "empate") return "Empate";
    const participante = resultado === "a" ? partida.participante_a : partida.participante_b;
    return participante?.nome || "Vencedor";
  };

  const renderPartida = (partida) => (
    <article key={partida.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">
        {faseLabels[partida.fase]}{partida.rodada ? ` ${partida.rodada}` : ""} · Partida {partida.numero_partida}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={partida.resultado === "a" ? "font-semibold text-yellow-300" : ""}>
          {partida.participante_a?.nome || "Aguardando classificado"}
        </span>
        <span className="text-gray-500">vs</span>
        <span className={partida.resultado === "b" ? "font-semibold text-yellow-300" : ""}>
          {partida.participante_b?.nome || "Aguardando classificado"}
        </span>
      </div>
      {partida.concluida && (
        <p className="mt-2 text-sm text-green-300">Resultado: {nomeResultado(partida, partida.resultado)}</p>
      )}
      {podeEditarResultados && partida.participante_a && partida.participante_b && (
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            aria-label={`Resultado da partida ${partida.numero_partida}`}
            value={resultados[partida.id] ?? partida.resultado ?? ""}
            onChange={(event) => setResultados((atual) => ({ ...atual, [partida.id]: event.target.value }))}
            className="min-w-0 flex-1 rounded border border-white/10 bg-black p-2 text-sm text-white"
          >
            <option value="">Selecione o resultado</option>
            <option value="a">Vitória: {partida.participante_a.nome}</option>
            {formato === "pontos" && <option value="empate">Empate</option>}
            <option value="b">Vitória: {partida.participante_b.nome}</option>
          </select>
          <button
            type="button"
            disabled={salvando || !(resultados[partida.id] ?? partida.resultado)}
            onClick={() => requisitar(() => axiosClient.put(
              `${base}/partidas/${partida.id}/resultado`,
              { resultado: resultados[partida.id] ?? partida.resultado },
            ))}
            className="rounded bg-[#81700e] px-3 py-2 text-sm disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      )}
    </article>
  );

  if (!estruturada && competicao.modo !== "personalizado") return null;

  return (
    <section className="mt-6 w-full rounded-xl border border-[#c09318]/40 bg-black/30 p-4">
      <h2 className="mb-3 text-xl font-semibold text-[#daa520]">
        {estruturada ? (mataMata ? "Chave e resultados" : "Classificação por pontos") : "Pódio da competição"}
      </h2>
      {carregando ? (
        <p className="text-sm text-gray-300">Carregando resultados...</p>
      ) : (
        <>
          {erro && <p role="alert" className="mb-3 text-sm text-red-300">{erro}</p>}
          {mensagem && <p role="status" className="mb-3 text-sm text-green-300">{mensagem}</p>}

          {!estruturada && (
            <div className="space-y-3">
              {lugares.map(([field, key, label]) => (
                <label key={field} className="flex flex-col gap-1 text-sm text-gray-300">
                  {label}
                  <select
                    value={podio[field] ?? ""}
                    disabled={!organizador || salvando}
                    onChange={(event) => setPodio((atual) => ({ ...atual, [field]: event.target.value }))}
                    className="rounded border border-white/10 bg-black p-2 text-white"
                  >
                    <option value="">Não definido</option>
                    {aprovados.map((participante) => (
                      <option key={participante.id} value={participante.id_participante}>
                        {nomeParticipante(participante)}
                      </option>
                    ))}
                  </select>
                  {dados?.podio?.[key]?.nome && <span className="text-xs text-gray-400">Atual: {dados.podio[key].nome}</span>}
                </label>
              ))}
              {organizador && (
                <button
                  type="button"
                  disabled={salvando}
                  onClick={() => requisitar(() => axiosClient.put(`${base}/podio`, {
                    primeiro_lugar_id: podio.primeiro_lugar_id || null,
                    segundo_lugar_id: podio.segundo_lugar_id || null,
                    terceiro_lugar_id: podio.terceiro_lugar_id || null,
                  }))}
                  className="rounded bg-[#81700e] px-4 py-2 text-sm disabled:opacity-50"
                >
                  Salvar pódio
                </button>
              )}
            </div>
          )}

          {estruturada && mataMata && (
            <div className="space-y-4">
              {organizador && dados.partidas.length === 0 && (
                <button
                  type="button"
                  disabled={salvando}
                  onClick={() => requisitar(() => axiosClient.post(`${base}/chave`))}
                  className="rounded bg-[#81700e] px-4 py-2 text-sm disabled:opacity-50"
                >
                  Gerar chave ({competicao.quantidade_participantes || dados.configuracao.quantidade_participantes} participantes aprovados)
                </button>
              )}
              {dados.partidas.map(renderPartida)}
              {dados.podio?.primeiro_lugar && (
                <p className="text-sm text-yellow-200">
                  Campeão: {dados.podio.primeiro_lugar.nome}
                  {dados.podio.segundo_lugar && ` · Vice: ${dados.podio.segundo_lugar.nome}`}
                  {dados.podio.terceiro_lugar && ` · 3º lugar: ${dados.podio.terceiro_lugar.nome}`}
                </p>
              )}
            </div>
          )}

          {estruturada && formato === "pontos" && (
            <div className="space-y-4">
              {podeEditarResultados && (
                <form
                  className="grid gap-2 sm:grid-cols-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    requisitar(async () => {
                      await axiosClient.post(`${base}/partidas`, {
                        rodada: Number(rodada),
                        participante_a_id: Number(participanteA),
                        participante_b_id: Number(participanteB),
                      });
                      setParticipanteA("");
                      setParticipanteB("");
                    });
                  }}
                >
                  <label className="text-sm text-gray-300">
                    Rodada
                    <input
                      type="number"
                      min="1"
                      max={competicao.numero_rodadas || dados.configuracao.numero_rodadas}
                      value={rodada}
                      onChange={(event) => setRodada(event.target.value)}
                      className="mt-1 w-full rounded border border-white/10 bg-black p-2 text-white"
                    />
                  </label>
                  {[["Participante A", participanteA, setParticipanteA], ["Participante B", participanteB, setParticipanteB]].map(([label, value, setter]) => (
                    <label key={label} className="text-sm text-gray-300">
                      {label}
                      <select required value={value} onChange={(event) => setter(event.target.value)} className="mt-1 w-full rounded border border-white/10 bg-black p-2 text-white">
                        <option value="">Selecionar</option>
                        {aprovados.map((participante) => (
                          <option key={participante.id} value={participante.id_participante}>{nomeParticipante(participante)}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                  <button type="submit" disabled={salvando || !participanteA || !participanteB} className="rounded bg-[#81700e] px-4 py-2 text-sm disabled:opacity-50 sm:col-span-2">
                    Adicionar confronto
                  </button>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="border-b border-white/20 text-gray-300">
                    <tr>
                      {["Posição", "Participante", "Partidas", "Vitórias", "Empates", "Derrotas", "Pontos"].map((titulo) => <th key={titulo} className="p-2">{titulo}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {dados.classificacao.map((linha) => (
                      <tr key={`${linha.participante.tipo}-${linha.participante.id}`} className="border-b border-white/10">
                        <td className="p-2">{linha.posicao}</td>
                        <td className="p-2">{linha.participante.nome}</td>
                        <td className="p-2">{linha.partidas}</td>
                        <td className="p-2">{linha.vitorias}</td>
                        <td className="p-2">{linha.empates}</td>
                        <td className="p-2">{linha.derrotas}</td>
                        <td className="p-2 font-semibold">{linha.pontos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-2">{dados.partidas.map(renderPartida)}</div>
              <p className="text-xs text-gray-400">
                Desempates: pontos, vitórias, empates, menos derrotas e ordem de inscrição (data e ID).
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default CompeticaoResultados;
