const modalData = [
  {
    name: 'Tonic',
    desc: 'Akarr',
    imageSrc: '',
    technologies: ['css'],
    link_live: 'https://tkz96.github.io/',
    link_github: 'https://github.com/tkz96/tkz96.github.io',
  },
  {
    name: 'Multi-Post Stories',
    desc: 'Bakkarr',
    imageSrc: '',
    technologies: [],
    link_live: 'https://tkz96.github.io/',
    link_github: 'https://github.com/tkz96/tkz96.github.io',
  },
  {
    name: 'Tonic',
    desc: 'Bambay',
    imageSrc: '',
    technologies: [],
    link_live: 'https://tkz96.github.io/',
    link_github: 'https://github.com/tkz96/tkz96.github.io',
  },
  {
    name: 'Multi-Post Stories',
    desc: 'Bo',
    imageSrc: '',
    technologies: ['html', 'js'],
    link_live: 'https://tkz96.github.io/',
    link_github: 'https://github.com/tkz96/tkz96.github.io',
  },
];

const openModal = () => {
  const overlay = document.getElementById('overlay');
  overlay.style.display = 'flex';
};

// eslint-disable-next-line no-unused-vars
const closeModal = () => {
  const overlay = document.getElementById('overlay');
  overlay.style.display = 'none';
};

const openModalWithData = (i) => {
  const data = modalData[i];

  const title = document.getElementById('modal-title');
  const desc = document.getElementById('modal-desc');
  const tagsContainer = document.getElementById('modal-tags');

  title.innerText = data.name;
  desc.innerText = data.desc;

  tagsContainer.innerHTML = data.technologies.map((tech) => `<li class="tag">${tech}</li>`).join('');

  //navMenu.classList.remove('active');
  openModal();
};