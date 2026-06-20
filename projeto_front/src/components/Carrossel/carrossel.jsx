import { useMemo } from "react";
import Card from "../Card/Cards.jsx";

const Carrossel = ({ equipe, competicao }) => {
  const maxCards = 5;

  const items = useMemo(() => {
    return equipe || competicao || [];
  }, [equipe, competicao]);

  return (
    <div className="carrossel no-scrollbar">
      {items.slice(0, maxCards).map((item, index) => (
        <Card key={item.id || index} info={item} />
      ))}
    </div>
  );
};

export default Carrossel;
