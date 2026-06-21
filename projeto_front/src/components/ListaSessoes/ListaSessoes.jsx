import "./listaSessoes.css";

const ListaSessoes = ({ sessoes }) => {
  if (!sessoes || sessoes.length === 0) {
    return <p className="lista-sessoes-vazia">Nenhuma sessão encontrada.</p>;
  }

  return (
    <div className="lista-sessoes">
      {sessoes.map((sessao) => (
        <a
          className="linha-sessao"
          key={sessao.id}
          href={`/sessoes/${sessao.id}`}
        >
          <div>
            <div className="sessao-nome">{sessao.titulo}</div>
            {sessao.descricao && (
              <div className="sessao-descricao">{sessao.descricao}</div>
            )}
          </div>
          <div className="sessao-jogo">{sessao.jogo}</div>
          <div className="sessao-criador">
            {sessao.criador_nome
              ? `Criador: ${sessao.criador_nome}`
              : `Criador #${sessao.criador_id}`}
          </div>
          <div className="sessao-vagas">
            {sessao.lotacao ||
              `${sessao.jogadores_count || 0}/${sessao.max_jogadores}`}
          </div>
          <div className="sessao-status">
            {sessao.status_label || sessao.status}
          </div>
        </a>
      ))}
    </div>
  );
};

export default ListaSessoes;
