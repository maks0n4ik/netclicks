
const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2' 

const leftMenu = document.querySelector('.left-menu'),
      hamburger = document.querySelector('.hamburger'),
      tvShowList = document.querySelector('.tv-shows__list'),
      modal = document.querySelector('.modal'),
      tvShows = document.querySelector('.tv-shows'),
      tvCardImg = document.querySelector('.tv-card__img'),
      modalTitle = document.querySelector('.modal__title'),
      modalLink = document.querySelector('.modal__link'),
      genresList = document.querySelector('.genres-list'),
      rating = document.querySelector('.rating'),
      description = document.querySelector('.description'),
      searchFormInput = document.querySelector('.search__form-input'),
      searchForm = document.querySelector('.search__form'),
      preloader = document.querySelector('.preloader'),
      dropdown = document.querySelectorAll('.dropdown'),
      tvShowsHead = document.querySelector(".tv-shows__head"),
      imageContent = document.querySelector('.image__content'),
      modalContent = document.querySelector('.modal__content'),
      pagination = document.querySelector('.pagination');

const loading = document.createElement('div')
loading.className = 'loading';

function removeImageContent () {
  imageContent.style.display = 'none'
  modalContent.style.padding = '50px'
}

class DBService {

  constructor(){
    this.API_KEY = 'ca1316f9e55aab5d86987db8f9cb0589';
    this.SERVER = 'https://api.themoviedb.org/3'
  }

  getData = async (url) => {
    const res = await fetch(url);
    if(res.ok) {
      return res.json()
    } else {
      throw new Error(`Не удалось получить данные по адресу ${url}`)
    }
  }

  getTestData =  () => {
    return  this.getData('test.json');
  }

  getTestCard = () => {
    return  this.getData('card.json');
  }

  getSearchResult = query => {
    return this.getData(this.SERVER + '/search/tv?api_key=' + this.API_KEY + 
      '&lahguage=ru-RU&query=' + query);
  }

  getTvShow = id => {
    this.temp = this.SERVER + '/tv/' + id + '?api_key=' + this.API_KEY + '&lahguage=ru-RU'
    return this.getData(this.temp);
  }

  getNextPage = page => {
    return this.getData(this.temp + '&page=' + page)
  }

  getTopRated = () => this.getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=ru-RUS&page=1`);

  getWeek = () => this.getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=ru-RUS&page=1`);

  getToday = () => this.getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=ru-RUS&page=1`);

  getPopular = () => this.getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=ru-RUS&page=1`);

}

const dbService = new DBService();

const renderCard = (response, target) => {

  tvShowList.innerHTML = '';

  

  if(!response.total_results) {
    loading.remove();
    tvShowsHead.textContent = 'По вашему запросу ничего не найдено...';
    return;
  }

  tvShowsHead.textContent = target ? target.textContent : 'Результат поиска'

  response.results.forEach(item => {

    const { backdrop_path: backdrop, 
        name: title, 
        poster_path: poster, 
        vote_average: vote,
        id
        } = item

    const posterImg = poster ? IMG_URL + poster : '../img/no-poster.jpg';
    const backdropImg = backdrop ? IMG_URL + backdrop : '';
    const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

    const card = document.createElement('li');
    card.idTv = id;
    card.className = 'tv-shows__item';
    card.innerHTML = `
      <a href="#" id="${id}" class="tv-card">
        ${voteElem}
        <img class="tv-card__img"
          src="${posterImg}"
          data-backdrop="${backdropImg}"
          alt="${title}">
        <h4 class="tv-card__head">${title}</h4>
      </a>
    `;
        loading.remove();
    tvShowList.append(card);
  });

  pagination.textContent = '';

  if(response.total_pages > 1 ) {
    for(let i = 1; i <= response.total_pages; i++) {
      pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
    }
  }

};



searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const value = searchFormInput.value;
  if(value) {
    
    tvShows.append(loading);
    dbService.getSearchResult(value).then(renderCard);
  }
  searchFormInput.value = '';
});

{
  
}

const closeDropdown = () => {
  dropdown.forEach(item => {
    item.classList.remove('active')
  })
}

hamburger.addEventListener('click', () => {
  leftMenu.classList.toggle('openMenu');
  hamburger.classList.toggle('open');
  closeDropdown();
});

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!target.closest('.left-menu')){
    leftMenu.classList.remove('openMenu');
    hamburger.classList.remove('open');
  }
});

leftMenu.addEventListener('click', event => {
  event.preventDefault();
  const target = event.target;
  const dropDown = target.closest('.dropdown');
  if (dropDown){
    dropDown.classList.toggle('active');
    leftMenu.classList.add('openMenu');
    hamburger.classList.add('open');
  }

  if(target.closest('#top-rated')) {
    
    tvShows.append(loading);
    dbService.getTopRated().then((response) => renderCard(response, target));
  }

  if(target.closest('#week')) {
    
    tvShows.append(loading);
    dbService.getWeek().then((response) => renderCard(response, target));
  }

  if(target.closest('#today')) {
    
    tvShows.append(loading);
    dbService.getToday().then((response) => renderCard(response, target));
  }

  if(target.closest('#popular')) {
    
    tvShows.append(loading);
    dbService.getPopular().then((response) => renderCard(response, target));
  }

  if(target.closest('#search')) {
    tvShowList.innerHTML = '';
    tvShowsHead.textContent = ''
  }
});

tvShowList.addEventListener('click', event => {

  event.preventDefault();

  const target = event.target;
  const card = target.closest('.tv-card');

  if(card){
    preloader.style.display = 'block';
    dbService.getTvShow(card.id)
        .then(({  
            poster_path :posterPath,
            name: title, homepage,
            vote_average: voteAverage,
            overview,
            genres }) => {
          const posterImg = posterPath ? IMG_URL + posterPath : removeImageContent();
          const voteElem = voteAverage ? `${voteAverage}` : `Рейтинг отсутствует`;
          const desElem = overview ? `${overview}` : `Обзор отсутствует`;
          const titleName = title ? `${title}` : `Жанр неизвестен`;
          tvCardImg.src = posterImg;
          tvCardImg.alt = title;
          genresList.textContent = '';
          genres.forEach(item => {
              genresList.innerHTML += `<li>${item.name}</li>`
          })
          modalTitle.textContent = title;
          modalLink.href = homepage;
          rating.textContent = voteElem;
          description.textContent = desElem;

        })
        .then(() => {
          document.body.style.overflow = 'hidden';
          modal.classList.remove('hide');
          preloader.style.display = 'none';
        })
  }
});

modal.addEventListener('click', event => {

  if( event.target.closest('.cross') ||
      event.target.classList.contains('modal')) {
      document.body.style.overflow = ''
      modal.classList.add('hide')
    }
});

const changeImage = event => {
  const card = event.target.closest('.tv-shows__item');

  if(card) {
    const img = card.querySelector('.tv-card__img');
    
    if(img.dataset.backdrop) {
      [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]
    }
    
  }
}

tvShowList.addEventListener('mouseover', changeImage);
tvShowList.addEventListener('mouseout', changeImage);

pagination.addEventListener('click', (event) => {
  event.preventDefault();
  const target = event.target;
  if(target.classList.contains('pages')) {
    tvShows.append(loading);
    dbService.getNextPage(target.textContent).then(renderCard)
  }
})