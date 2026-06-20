import "./Home.css";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import { Header } from "../components/Header/Header.jsx";
import { Footer } from "../components/Footer/footer.jsx";
import { NavBar } from "../components/NavBar/NavBar.jsx";
import Carrossel from "../components/Carrossel/carrossel.jsx";
import ListaSessoes from "../components/ListaSessoes/ListaSessoes.jsx";
import { useCompeticoes } from "../context/CompeticoesProvider";
import { useEquipes } from "../context/EquipesProvider";
import { useSessoes } from "../context/SessoesProvider";

const Home = () => {
  const { data: competicoes } = useCompeticoes();
  const { data: equipes } = useEquipes();
  const { data: sessoes } = useSessoes();

  return (
    <div className="home-body relative">
      {/* Background */}
      <div className="background-layer">
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
      <Header />
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
        <section className="secao-sessoes">
          <h2 className="titulo-secao">Sessões</h2>
          <ListaSessoes sessoes={sessoes || []} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
