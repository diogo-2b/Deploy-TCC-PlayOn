import { Link } from "react-router";
import LightPillar from "../components/LightPillar/LightPillar.jsx";
import { Footer } from "../components/Footer/footer.jsx";
import { Header } from "../components/Header/Header.jsx";
import { NavBar } from "../components/NavBar/NavBar.jsx";
import "./Home.css";

const Ajuda = () => {
  return (
    <div className="home-body relative">
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
        <div className="mx-auto w-full max-w-5xl px-4 pb-12 text-white">
          <section className="mb-6 rounded-2xl border border-[#c09318]/40 bg-black/40 p-6 shadow-2xl backdrop-blur-md sm:p-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#c09318]">
              Central de ajuda
            </p>
            <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
              Bem-vindo ao PlayOn
            </h1>
            <p className="max-w-3xl text-gray-300">
              O PlayOn reúne jogadores para organizar competições, formar
              equipes e combinar sessões de jogo em um só lugar.
            </p>
          </section>

          <section className="mb-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
              <h2 className="mb-2 text-lg font-semibold text-[#c09318]">
                Competições
              </h2>
              <p className="text-sm leading-6 text-gray-300">
                Explore torneios, confira as informações e participe. Se
                organizar uma competição, acompanhe inscrições e participantes.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
              <h2 className="mb-2 text-lg font-semibold text-[#c09318]">
                Equipes
              </h2>
              <p className="text-sm leading-6 text-gray-300">
                Encontre jogadores com interesses em comum ou crie uma equipe
                para jogar e competir juntos.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
              <h2 className="mb-2 text-lg font-semibold text-[#c09318]">
                Sessões
              </h2>
              <p className="text-sm leading-6 text-gray-300">
                Combine partidas com outros jogadores e consulte os detalhes
                das sessões disponíveis.
              </p>
            </article>
          </section>

          <section className="mb-6 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md sm:p-8">
            <h2 className="mb-3 text-xl font-bold">Dicas para começar</h2>
            <ul className="space-y-2 text-sm leading-6 text-gray-300">
              <li>• Mantenha seu perfil atualizado para que outros jogadores reconheçam você.</li>
              <li>• Confira as regras e os detalhes antes de entrar em uma competição ou sessão.</li>
              <li>• Não compartilhe sua senha ou outras informações pessoais.</li>
              <li>• Se encontrar conteúdo ou comportamento inadequado, use a opção de denúncia disponível na plataforma.</li>
            </ul>
          </section>

          <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#c09318]/40 bg-black/40 p-6 backdrop-blur-md sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="mb-1 text-xl font-bold">Pronto para jogar?</h2>
              <p className="text-sm text-gray-300">
                Explore o que a comunidade está organizando.
              </p>
            </div>
            <Link
              to="/competicoes"
              className="rounded-md bg-[#81700e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#978e0f]"
            >
              Ver competições
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Ajuda;
