/* import './sass/main.scss'; */
import ApiService from './js/apiService.js';
import createImageCard from './templates/image-card.hbs';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';
import '@pnotify/mobile/dist/PNotifyMobile.css';
import '@pnotify/countdown/dist/PNotifyCountdown.css';
import { alert } from '@pnotify/core';
import notificationOptions from './js/notificationSettings.js';
import * as basicLightbox from 'basiclightbox';
import { debounce } from 'debounce';
const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  body: document.querySelector('body'),
  anchor: document.querySelector('.anchor'),
};

const apiService = new ApiService();
const observer = new IntersectionObserver(observerCallback, {
  threshold: 0,
});

refs.searchForm.addEventListener('change', onSearch);
refs.gallery.addEventListener('click', onMakeBigImage);
window.addEventListener('scroll', onAddObserver);

function observerCallback() {
  onLoadMore();
}

function onAddObserver() {
  observer.observe(refs.anchor);
}

async function onSearch(e) {
  e.preventDefault();

  apiService.query = e.currentTarget.elements.query.value.trim();

  apiService.resetPage();
  clearGallery();
  await fetchImages();

  const fetchTotalHits = await apiService.fetchTotalHits();
  if (fetchTotalHits === 0) {
    return alert(notificationOptions.incorrectQuery);
  }

  if (apiService.query === '') {
    goPro(e);
    return alert(notificationOptions.notMachResults);
  }
  if (fetchTotalHits > 0) {
    (notificationOptions.successResult.title = `Found ${fetchTotalHits} ${apiService.query} images`),
      alert(notificationOptions.successResult);
  }
}

async function fetchImages() {
  if (apiService.query === '') {
    return;
  }

  const response = await apiService.fetchImages();
  const images = await createGallery(response);
  return images;
}

function createGallery(images) {
  refs.gallery.insertAdjacentHTML('beforeend', createImageCard(images));
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

async function onLoadMore() {
  await fetchImages();
  const fetchTotalHits = await apiService.fetchTotalHits();
  if (refs.gallery.children.length >= fetchTotalHits) {
    observer.unobserve(refs.anchor);
    alert(notificationOptions.imagesAreOver);
  }
}

function onMakeBigImage(e) {
  if (e.target.className !== 'photo-image') {
    return;
  }
  const largeImagePath = e.target.dataset.large_img;
  const instance = basicLightbox.create(`<img src="${largeImagePath}">`);

  instance.show();
}
function goPro(e) {
  /*   e.target.value = 'Писать сюда';
  setInterval(() => {
    e.target.value = '';
  }, 2000); */
  console.log(refs.anchor.classList);
  e.target.value = '';
  refs.anchor.classList.toggle('pro');
  setTimeout(() => {
    refs.anchor.classList.toggle('pro');
  }, 5000);
}
