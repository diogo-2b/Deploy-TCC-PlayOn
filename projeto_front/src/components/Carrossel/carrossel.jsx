import { useMemo } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Card from "../Card/Cards.jsx";
import "swiper/css";
import "swiper/css/navigation";

const Carrossel = ({ equipe, competicao }) => {
  const items = useMemo(() => {
    return (equipe || competicao || []).filter((item) => !item.encerrada);
  }, [equipe, competicao]);

  return (
    <div className="carrossel-container">
      <Swiper
        className="carrossel no-scrollbar"
        modules={[Navigation]}
        navigation
        slidesPerView="auto"
        centerInsufficientSlides
        spaceBetween={15}
        watchOverflow
        loop={items.length > 1}
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id || index}>
            <Card info={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carrossel;
