import Skeleton from "react-loading-skeleton";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import { Header } from "../components/Header/Header.jsx";
import { Footer } from "../components/Footer/footer.jsx";
import { NavBar } from "../components/NavBar/NavBar.jsx";
import Card from "../components/Card/Cards.jsx";
import { useEquipes } from "../context/EquipesProvider";

const ListaEquipes = () => {
  const { data: equipes, loading } = useEquipes();

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

      <Header />

      <main className="main-container relative z-10">
        <NavBar />
        <nav className="my-4 relative z-0">
          <div className="nav-container w-full">
            <ul className="flex justify-center space-x-6 w-full">
              <li>
                <a
                  className="text-white hover:text-yellow-300"
                  href="/equipes/cadastrar"
                >
                  Criar
                </a>
              </li>
              <li>
                <a className="text-white hover:text-yellow-300" href="/equipes">
                  Minhas Equipes
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <section className="secao-carrossel">
          <h2 className="titulo-secao">Equipes</h2>

          <div className="carrossel lista-grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <Skeleton height={220} className="rounded-xl" />
                  <div className="mt-4 space-y-2">
                    <Skeleton height={18} width="70%" />
                    <Skeleton height={14} width="90%" />
                    <Skeleton height={14} width="40%" />
                  </div>
                </div>
              ))
            ) : equipes && equipes.length > 0 ? (
              equipes.map((equipe) => (
                <div key={equipe.codigo} style={{ cursor: "pointer" }}>
                  <Card info={equipe} />
                </div>
              ))
            ) : (
              <p className="text-gray-300">Nenhuma equipe encontrada.</p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ListaEquipes;
