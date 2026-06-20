import LightPillar from "../components/LightPillar/LightPillar.jsx";
import { Footer } from "../components/Footer/footer.jsx";
import { NavBar } from "../components/NavBar/NavBar.jsx";
import Carrossel from "../components/Carrossel/carrossel.jsx";
import { useCompeticoes } from "../context/CompeticoesProvider";
import { useEquipes } from "../context/EquipesProvider";

const Index = () => {
  const { data: competicoes } = useCompeticoes();
  const { data: equipes } = useEquipes();

  return (
    <div className="home-body relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <LightPillar
          topColor="goldenrod"
          bottomColor="goldenrod"
          intensity={1}
          rotationSpeed={0.3}
          glowAmount={0.002}
          pillarWidth={3}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
      </div>

      <main className="main-container relative z-10">
        <NavBar />
        <section className="secao-carrossel">
          <h2 className="titulo-secao">Competições Recomendadas</h2>
          <Carrossel competicao={competicoes || []} />
        </section>
        <section className="secao-carrossel">
          <h2 className="titulo-secao">Equipes Recomendadas</h2>
          <Carrossel equipe={equipes || []} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
