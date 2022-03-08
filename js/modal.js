const openModal = () => {
  const overlay = document.getElementById('overlay');
  overlay.style.display = 'block';
};

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

  navMenu.classList.remove('active');
  openModal();
};