import { useNavigate } from "react-router";

const Card = ({ info }) => {
  const navigate = useNavigate();
  const descricao = (info?.descricao || "").trim();
  const titulo = (info?.nome || "").trim();

  const handleCardClick = (info) => {
    if (info && (info.dono !== undefined || info.inscricao !== undefined)) {
      navigate(`/competicao/${info.codigo}`);
      return;
    }
    navigate(`/equipe/${info.codigo}`);
  };

  const src =
    info.imagem_url || (info.imagem ? `/imagens/${info.imagem}` : undefined);

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
