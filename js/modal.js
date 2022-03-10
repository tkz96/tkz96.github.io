const modalData = [
  {
    name: 'Tonic',
    desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essent",
    imageMobile: 'assets/card-images/mobile/1.png',
    imageDesktop: 'assets/card-images/desktop/1.png',
    technologies: ['html', 'css', 'js'],
    link_live: 'https://tkz96.github.io/',
    link_github: 'https://github.com/tkz96/tkz96.github.io',
  },
  {
    name: 'Multi-Post Stories',
    desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essent",
    imageMobile: 'assets/card-images/mobile/2.png',
    imageDesktop: 'assets/card-images/desktop/2.png',
    technologies: ['html', 'css', 'js'],
    link_live: 'https://tkz96.github.io/',
    link_github: 'https://github.com/tkz96/tkz96.github.io',
  },
  {
    name: 'Tonic',
    desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essent",
    imageMobile: 'assets/card-images/mobile/3.png',
    imageDesktop: 'assets/card-images/desktop/3.png',
    technologies: ['html', 'css', 'js'],
    link_live: 'https://tkz96.github.io/',
    link_github: 'https://github.com/tkz96/tkz96.github.io',
  },
  {
    name: 'Multi-Post Stories',
    desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essent",
    imageMobile: 'assets/card-images/mobile/4.png',
    imageDesktop: 'assets/card-images/desktop/4.png',
    technologies: ['html', 'css', 'js'],
    link_live: 'https://tkz96.github.io/',
    link_github: 'https://github.com/tkz96/tkz96.github.io',
  },
];

const overlay = document.getElementById('overlay');

const openModal = () => {
  overlay.style.display = 'flex';
};
// eslint-disable-next-line no-unused-vars
const closeModal = () => {
  overlay.style.display = 'none';
};

// eslint-disable-next-line no-unused-vars
const openModalWithData = (i) => {
  const data = modalData[i];

  const title = document.getElementById('modal-title');
  const desc = document.getElementById('modal-desc');
  const tagsContainer = document.getElementById('modal-tags');
  const modalImgMobile = document.getElementById('modal-img-mobile');
  const modalImgDesktop = document.getElementById('modal-img-desktop');
  const modalButtonLive = document.getElementById('modal-button-live');
  const modalButtonSource = document.getElementById('modal-button-source');

  title.innerText = data.name;
  desc.innerText = data.desc;
  modalImgMobile.src = modalData[i].imageMobile;
  modalImgDesktop.src = modalData[i].imageDesktop;
  tagsContainer.innerHTML = data.technologies.map((tech) => `<li class="tag">${tech}</li>`).join('');

  modalButtonLive.onclick = () => { window.location.href = modalData[i].link_live; };
  modalButtonSource.onclick = () => { window.location.href = modalData[i].link_github; };

  openModal();
};