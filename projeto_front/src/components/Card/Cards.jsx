import { useNavigate } from "react-router";

const Card = ({ info }) => {
  const navigate = useNavigate();
  const descricao = (info?.descricao || "").trim();
  const titulo = (info?.nome || "").trim();

  const handleCardClick = (info) => {
    if (info?.acesso_detalhes === false) return;
    if (info && (info.dono !== undefined || info.inscricao !== undefined)) {
      navigate(`/competicao/${info.codigo}`);
      return;
    }
    if (info?.historico_resumido) return;
    navigate(`/equipe/${info.codigo}`);
  };

  const src =
    info.imagem_url ||
    (info.imagem ? `/imagens/${info.imagem}` : "https://res.cloudinary.com/ddpuzfnbd/image/upload/v1792605154/playon/equipes/22463a4f-6b4a-4864-971a-ccebc628ec7e.png");

  return (
    <div className="card" onClick={() => handleCardClick(info)}>
      <img src={src} alt={titulo || "Card"} />
      <div className="card-info">
        <h3 className="text-lg">{titulo}</h3>
        <p className="card-descricao">
          {descricao || "Sem descrição disponível."}
        </p>
      </div>
    </div>
  );
};

export default Card;
