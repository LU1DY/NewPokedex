const pokeName = document.getElementById("pokemonName");
const pokeNumber = document.getElementById("index");
const pokeImg = document.getElementById("picPokemon");
const input = document.getElementById("input");
const form = document.querySelector("form");
const btnPrev = document.getElementById("prev");
const btnNext = document.getElementById("next");
const pokemonImages = document.getElementById("pokemonImages");
const typesBox = document.querySelector(".detailsPokemon");
const description = document.getElementById("desc");
const cardsContainer = document.getElementById("bah");
const cardsLessBtn = document.getElementById("cardsLess");
const cardsMoreBtn = document.getElementById("cardsMore");
const containerCards = document.getElementById("containerCards");
const rowDetails = document.getElementById("rowDetails");
const statsBox = document.querySelector(".stats");
const pokeEvo = document.querySelector(".pokeEvo");
const imgTypes = document.getElementById("types");
let index = 1;

const fetchPokemon = async (pokemon) => {
  try {
    const apiResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemon}`
    );
    if (apiResponse.ok) {
      return await apiResponse.json();
    } else {
      throw new Error(`Erro ao buscar dados do Pokémon: ${pokemon}`);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchEvolutionGroup = async (pokemon) => {
  try {
    const apiResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${pokemon}/`
    );
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      for (const entry of data.flavor_text_entries) {
        if (entry.language.name === "en") {
          description.innerHTML = entry.flavor_text;
          break;
        }
      }
      return data.evolution_chain.url;
    } else {
      throw new Error(`Erro ao buscar grupo evolutivo do Pokémon: ${pokemon}`);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchEvolutionChain = async (evoGroupUrl) => {
  try {
    const apiResponse = await fetch(evoGroupUrl);
    if (apiResponse.ok) {
      return await apiResponse.json();
    } else {
      throw new Error(`Erro ao buscar cadeia evolutiva: ${evoGroupUrl}`);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getPokemonEvolution = async (pokemonId) => {
  try {
    const evoGroupUrl = await fetchEvolutionGroup(pokemonId);
    const evolutionData = await fetchEvolutionChain(evoGroupUrl);
    const speciesNames = extractSpeciesNames(evolutionData.chain);
    await fetchMultiplePokemon(speciesNames);
  } catch (error) {
    console.error("Erro ao buscar informações de evolução:", error);
  }
};

const extractSpeciesNames = (chain) => {
  let speciesNames = [];
  const traverse = (node) => {
    speciesNames.push(node.species.name);
    node.evolves_to.forEach((child) => traverse(child));
  };
  traverse(chain);
  return speciesNames;
};

const fetchMultiplePokemon = async (pokemonList) => {
  pokeEvo.innerHTML = "";
  for (const pokemon of pokemonList) {
    const data = await fetchPokemon(pokemon);
    if (data) {
      let type = data.types.map(
        (typeInfo) => `<span id="type">${typeInfo.type.name}</span>`
      );
      pokeEvo.innerHTML += `
      <div class="card-poke ${data.types[0].type.name}">
        <img src="${data.sprites.other["official-artwork"].front_default}" alt="${data.name}" width="100px" height="100px" />
      </div>`;
    } else {
      console.error(`Erro ao buscar dados do Pokémon: ${pokemon}`);
    }
  }
};

const renderPokemon = async (pokemon) => {
  const data = await fetchPokemon(pokemon);
  if (data) {
    const stats = {};
    data.stats.forEach((stat) => {
      stats[stat.stat.name] = stat.base_stat;
    });
    rowDetails.style.display = "flex";

    pokeName.innerHTML = data.name;
    pokeImg.src = data.sprites.other["official-artwork"].front_default;

    typesBox.innerHTML =
      data.types
        .map((typeInfo) => `<span id="type">${typeInfo.type.name}</span>`)
        .join("") + `<span id="index">n°${data.id}</span>`;
    imgTypes.src = `assets/tipos/${data.types[0].type.name}.png`;
    statsBox.innerHTML = `
      <li><h3>HP</h3><span id="hp">${stats.hp}</span></li>
      <li><h3>Ataque</h3><span id="atack">${stats.attack}</span></li>
      <li><h3>Defesa</h3><span id="defence">${stats.defense}</span></li>
      <li><h3>A. especial</h3><span id="aEspecial">${stats["special-attack"]}</span></li>
      <li><h3>D. especial</h3><span id="dEspecial">${stats["special-defense"]}</span></li>
      <li><h3>Velocidade</h3><span id="speed">${stats.speed}</span></li>`;

    searchPokemonCards(data.name);
    index = data.id;
  } else {
    pokeName.innerHTML = `Não encontrado`;
    typesBox.innerHTML = "<span>404</span>";
    description.innerHTML =
      "Desculpe, o pokemon informado não foi encontrado...";
    pokeImg.src = "assets/tipos/pikachu.png";
    types.src = "assets/tipos/pikachu.png";
    rowDetails.style.display = "none";
    input.value = "";
  }
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const pokemon = input.value.toLowerCase();
  renderPokemon(pokemon);
  getPokemonEvolution(pokemon);
  input.value = "";
});

btnNext.addEventListener("click", () => {
  if (index < 1025) {
    index++;
    renderPokemon(index);
    getPokemonEvolution(index);
  }
});

btnPrev.addEventListener("click", () => {
  if (index > 1) {
    index--;
    renderPokemon(index);
    getPokemonEvolution(index);
  }
});

const searchPokemonCards = async (name) => {
  const apiUrl = `https://api.pokemontcg.io/v1/cards?name=${name}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const cardsBox = document.querySelector(".cards");
    cardsBox.innerHTML = data.cards
      .slice(0, 2)
      .map(
        (card) => `
      <div class="card-poke-card">
        <img src="${card.imageUrl}" alt="${card.name}" />
      </div>`
      )
      .join("");
    if (data.cards.length === 0) {
      cardsBox.innerHTML = `<h2 style="text-align: justify; align-self: center;">O pokemon ${name}, não possui cartas.</h2>`;
      cardsMoreBtn.style.display = "none";
    }
    const cardsContainerMore = document.getElementById("cardsContainerMore");
    cardsContainerMore.innerHTML = data.cards
      .map(
        (card) => `
      <img src="${card.imageUrl}" alt="${card.name}" />`
      )
      .join("");
  } catch (error) {
    console.error("Erro ao buscar cartas Pokémon:", error);
  }
};

const addContainerCards = () => {
  containerCards.classList.remove("overlayContainerCards");
};
cardsMoreBtn.addEventListener("click", addContainerCards);

const removeContainerCards = () => {
  containerCards.classList.add("overlayContainerCards");
};
cardsLessBtn.addEventListener("click", removeContainerCards);

renderPokemon(index);
getPokemonEvolution(index);
