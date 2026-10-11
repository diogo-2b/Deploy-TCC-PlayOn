import { useMemo } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Card from "../Card/Cards.jsx";
import "swiper/css";
import "swiper/css/navigation";

const Carrossel = ({ equipe, competicao }) => {
  const maxCards = 5;

  const items = useMemo(() => {
    return equipe || competicao || [];
  }, [equipe, competicao]);

  return (
    <div className="carrossel-container">
      <Swiper
        className="carrossel no-scrollbar"
        modules={[Navigation]}
        navigation
        slidesPerView="auto"
        spaceBetween={15}
        watchOverflow
      >
        {items.slice(0, maxCards).map((item, index) => (
          <SwiperSlide key={item.id || index}>
            <Card info={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carrossel;
