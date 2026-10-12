const API_KEY = '46e1f4c2db4cd99e7fc684efd930f294'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const seriesGrid    = document.getElementById('series-grid');
const loadingDiv    = document.getElementById('loading');
const errorDiv      = document.getElementById('error');
const errorMessage  = document.getElementById('error-message');
const resultsTitle  = document.getElementById('results-title');
const resultsCount  = document.getElementById('results-count');
const searchInput   = document.getElementById('search');
const clearBtn      = document.getElementById('clear-search');
const retryBtn      = document.getElementById('retry-btn');
const themeToggle   = document.getElementById('theme-toggle');
const modal         = document.getElementById('serie-modal');
const modalBody     = document.getElementById('modal-body');
const modalClose    = document.getElementById('modal-close');
const modalOverlay  = document.getElementById('modal-overlay');

// ============================================================================
// UTILIDADES DE UI (DADO - no modificar)
// ============================================================================
const mostrarLoading = () => {
    loadingDiv.style.display = 'flex';
    errorDiv.style.display = 'none';
    seriesGrid.innerHTML = '';
};

const ocultarLoading = () => {
    loadingDiv.style.display = 'none';
};

const mostrarError = (mensaje) => {
    ocultarLoading();
    errorMessage.textContent = mensaje;
    errorDiv.style.display = 'flex';
    seriesGrid.innerHTML = '';
};
// ============================================================================
// DARK MODE (DADO - no modificar)
// ============================================================================
const aplicarTema = (tema) => {
    document.documentElement.setAttribute('data-theme', tema);
    themeToggle.textContent = tema === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', tema);
};

const cargarTema = () => {
    const guardado = localStorage.getItem('theme');
    const preferido = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    aplicarTema(guardado || preferido);
};

themeToggle.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-theme');
    aplicarTema(actual === 'dark' ? 'light' : 'dark');
});

cargarTema();


const obtenerPopulares = async () => {
    mostrarLoading();

    try {
        const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=es-ES`;
        const respuesta = await fetch(url);

        if (!respuesta.ok)
        {
            throw new Error (respuesta.status ); 
        }
        const datos = await respuesta.json() ;  
        mostrarSeries (datos.results);

        resultsTitle.textContent = 'Populares';
        resultsCount.textContent = `${datos.results.length} series encontradas`;
    }

    catch(error){
        manejar(error);
    } finally{
        ocultarLoading();
    }
};


const crearTarjeta = (serie) => {
    const {id, name, poster_path, first_air_date, vote_average } = serie;
    
    const imagen = poster_path
    ?`${IMAGE_URL}${poster_path}`
    : '';

    const año = first_air_date
    ? first_air_date
    : 'N/a';

    const rating = vote_average
    ? vote_average
    :'N/a';

    const tarjeta = document.createElement('article');
    tarjeta.classList.add('serie-card');

    tarjeta.innerHTML = `
    <div class="serie-card__poster">
    <img
    class="serie-card__image"
    src="${imagen}"
    alt="Poster de la serie">
    <span class="serie-card__rating"> ${rating}</span>
    </div>
    <div class="serie-card__content">
    <h3 class="serie-card__title"></h3>
    <p class="serie-card__year">Año: ${año}</p>
    </div> `;

    tarjeta.querySelector('.serie-card__title').textContent = name;
    tarjeta.addEventListener('click', () => {
        obtenerDetalleSerie(id);
    });

    return tarjeta;
 };

 const mostrarSeries = (series) => {
seriesGrid.innerHTML = '';
series.forEach((serie) => {
const tarjeta = crearTarjeta(serie);
seriesGrid.appendChild(tarjeta);
});
 };



const buscarSeries = async () =>{
    const texto = searchInput.value.trim();

  if (texto === '') {
    obtenerPopulares();
    return;
    }
    mostrarLoading();

    try{
    const url = `${BASE_URL}/search/tv?query=${encodeURIComponent(texto)}&api_key=${API_KEY}&language=es-ES`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
    throw new Error(respuesta.status);
        }
        const datos = await respuesta.json();
        mostrarSeries(datos.results);
        resultsTitle.textContent = 'Resultados de búsqueda';
        resultsCount.textContent = `${datos.results.length} series encontradas`;
    } catch (error) {
    manejar(error);
    } finally {
     ocultarLoading();
    }
};
searchInput.addEventListener('input', () => {
    buscarSeries();
});
clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    obtenerPopulares();
});

    const obtenerDetalleSerie = async (id) => {
        try{
        const url = `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=es-ES`;
        const respuesta = await fetch(url);
        if(!respuesta.ok)
        {
            throw new Error (respuesta.status);
        }
        const serie = await respuesta.json();
        mostrarDetalleSerie(serie);
        }
        catch (error) {
            manejar(error);
        }
    };

    const mostrarDetalleSerie = (serie) => {
    const {
    name,
    overview,
    number_of_seasons,
    number_of_episodes,
    genres,
    status
    } = serie;

    const generos = genres.map((genero) => genero.name).join(', ');
    modalBody.innerHTML = `
        <h2 class="modal__title"></h2>
        <p class="modal__subtitle">
            Estado: ${status || 'No disponible'}
        </p>
        <div class="modal__info">
            <p>Temporadas: ${number_of_seasons}</p>
            <p>Episodios: ${number_of_episodes}</p>
            <p>Géneros: ${generos || 'No disponibles'}</p>
        </div>
        <h3>Sinopsis</h3>
        <p class="modal__overview"></p>
    `;
    modalBody.querySelector('.modal__title').textContent = name;
    modalBody.querySelector('.modal__overview').textContent =
    overview || 'Sin sinopsis disponible';
    modal.classList.add('modal--show');
};
const cerrarModal = () => {
    modal.classList.remove('modal--show');
};
modalClose.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', cerrarModal);

const manejar = (error) => {
    console.error(error);

    if (error.message.includes('401')){
        mostrarError ('API Key no vslida');
    }
    else if(error.message.includes('Failed to fetch'))
    {
     mostrarError('error de conexion');
    }

    retryBtn.addEventListener('click', () => {
    if (searchInput.value.trim() !== '') {
        buscarSeries();
    } else {
        obtenerPopulares();
    }   
    });
obtenerPopulares();












}