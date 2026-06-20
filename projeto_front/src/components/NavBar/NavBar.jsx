import { useEffect, useRef, useState } from "react";
import { useSearch } from "../../context/SearchProvider.jsx";
import { useCompeticoes } from "../../context/CompeticoesProvider";
import { useEquipes } from "../../context/EquipesProvider";
import { useSessoes } from "../../context/SessoesProvider";

export const NavBar = () => {
  const { searchTerm, setSearchTerm } = useSearch();
  const { data: competicoes } = useCompeticoes();
  const { data: equipes } = useEquipes();
  const { data: sessoes } = useSessoes();

  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const [input, setInput] = useState(searchTerm || "");

  const normalized = (s) => (s || "").toLowerCase();

  const resultsCompeticoes = (competicoes || []).filter((c) =>
    normalized(c.nome).includes(normalized(searchTerm)),
  );
  const resultsEquipes = (equipes || []).filter((e) =>
    normalized(e.nome).includes(normalized(searchTerm)),
  );
  const resultsSessoes = (sessoes || []).filter((s) =>
    normalized(s.titulo).includes(normalized(searchTerm)),
  );

  // handle local input changes (immediate) and debounce updating global searchTerm
  useEffect(() => setInput(searchTerm || ""), [searchTerm]);

  useEffect(() => {
    const id = setTimeout(() => setSearchTerm(input), 200);
    return () => clearTimeout(id);
  }, [input, setSearchTerm]);

  // close on Escape
  useEffect(() => {
    const onEsc = (ev) => {
      if (ev.key === "Escape") setSearchTerm("");
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [setSearchTerm]);

  // close when clicking outside the input/modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      const t = e.target;
      if (
        modalRef.current &&
        !modalRef.current.contains(t) &&
        inputRef.current &&
        !inputRef.current.contains(t)
      ) {
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setSearchTerm]);

  return (
    <nav className="nav-principal">
      <div className="nav-container overflow-visible">
        <ul>
          <li>
            <a href="/home">Início</a>
          </li>
          <li>
            <a href="/equipes">Equipes</a>
          </li>
          <li>
            <a href="/competicoes">Competições</a>
          </li>
          <li>
            <a href="/sessoes">Sessões</a>
          </li>
          <li>
            <a href="/perfil">Perfil</a>
          </li>
        </ul>

        <div className="nav-search-container" ref={modalRef}>
          <input
            ref={inputRef}
            className="nav-search"
            type="search"
            placeholder="Pesquisar..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Busca"
            autoComplete="off"
          />

          {searchTerm && searchTerm.trim().length > 0 && (
            <div
              className="nav-search-modal"
              role="dialog"
              aria-label="Resultados da busca"
            >
              <div className="nav-search-section">
                <div className="nav-search-section-title">Competições</div>
                {resultsCompeticoes.length === 0 && (
                  <div className="nav-search-empty">
                    Nenhuma competição encontrada
                  </div>
                )}
                {resultsCompeticoes.map((c) => (
                  <a
                    key={c.codigo}
                    href={`/competicao/${c.codigo}`}
                    className="search-result-item"
                    onClick={() => setSearchTerm("")}
                  >
                    <div className="result-title">{c.nome}</div>
                    {c.descricao && (
                      <div className="result-sub">{c.descricao}</div>
                    )}
                  </a>
                ))}
              </div>

              <div className="nav-search-section">
                <div className="nav-search-section-title">Equipes</div>
                {resultsEquipes.length === 0 && (
                  <div className="nav-search-empty">
                    Nenhuma equipe encontrada
                  </div>
                )}
                {resultsEquipes.map((e) => (
                  <a
                    key={e.codigo}
                    href={`/equipe/${e.codigo}`}
                    className="search-result-item"
                    onClick={() => setSearchTerm("")}
                  >
                    <div className="result-title">{e.nome}</div>
                    {e.descricao && (
                      <div className="result-sub">{e.descricao}</div>
                    )}
                  </a>
                ))}
              </div>

              <div className="nav-search-section">
                <div className="nav-search-section-title">Sessões</div>
                {resultsSessoes.length === 0 && (
                  <div className="nav-search-empty">
                    Nenhuma sessão encontrada
                  </div>
                )}
                {resultsSessoes.map((s) => (
                  <a
                    key={s.id}
                    href={`/sessoes/${s.id}`}
                    className="search-result-item"
                    onClick={() => setSearchTerm("")}
                  >
                    <div className="result-title">{s.titulo}</div>
                    {s.descricao && (
                      <div className="result-sub">{s.descricao}</div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
