
const projects = [
  { id: 1, title: "Cybersecurity Basics Workshop", category: "Workshop", summary: "Intro to defensive tactics and safe coding.", img: "images/workshop-1-low.jpg", fullImg: "images/workshop-1.jpg", alt: "students at a workshop" },
  { id: 2, title: "Portfolio Starter Template", category: "Template", summary: "A responsive starter template for portfolios.", img: "images/portfolio-low.jpg", fullImg: "images/portfolio.jpg", alt: "portfolio screenshot" }
];

const projectsContainer = document.querySelectorAll('#projects-list, #projects-list-page')[0] || document.getElementById('projects-list');
const filterSelect = document.querySelector('#project-filter') || document.getElementById('project-filter-page');
const newsletterForm = document.getElementById('newsletter-form');
const signupStorageKey = 'wc_newsletter_signups';

function renderProjects(list, container = document.getElementById('projects-list')) {
  container = container || document.getElementById('projects-list');
  const html = list.map(p => `
    <article class="card" data-id="${p.id}" tabindex="0" aria-labelledby="proj-${p.id}">
      <div class="card-media">
        <img data-src="${p.fullImg}" src="${p.img}" alt="${p.alt}" loading="lazy" class="lazy-img">
      </div>
      <div class="card-body">
        <h3 id="proj-${p.id}">${p.title}</h3>
        <p>${p.summary}</p>
        <p class="meta">${p.category}</p>
      </div>
    </article>
  `).join('');
  container.innerHTML = html;
  attachCardListeners(container);
  lazyLoadInit();
}

function attachCardListeners(container = document.getElementById('projects-list')){
  const cards = container.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('click', () => openProjectModal(Number(card.dataset.id)));
    card.addEventListener('keypress', (e) => { if (e.key === 'Enter') card.click(); });
  });
}

function openProjectModal(id){
  const project = projects.find(p => p.id === id);
  if(!project){ alert('Project not found.'); return; }
  alert(`${project.title}\n\n${project.summary}`);
}

function filterProjects(category){
  if(!category || category === 'all'){ renderProjects(projects); return; }
  const filtered = projects.filter(p => p.category === category);
  renderProjects(filtered);
}

function handleNewsletterSubmit(e){
  if(!newsletterForm) return;
  e.preventDefault();
  const formData = new FormData(newsletterForm);
  const name = (formData.get('name') || '').trim();
  const email = (formData.get('email') || '').trim();
  if(!email || !/^\S+@\S+\.\S+$/.test(email)) { alert('Please enter a valid email address.'); return; }
  const signup = { name, email, date: new Date().toISOString() };
  const existing = JSON.parse(localStorage.getItem(signupStorageKey) || '[]');
  const exists = existing.some(s => s.email.toLowerCase() === email.toLowerCase());
  if(exists){ alert('You are already signed up.'); return; }
  existing.push(signup);
  localStorage.setItem(signupStorageKey, JSON.stringify(existing));
  newsletterForm.reset();
  alert('Thanks — you are signed up!');
}

function lazyLoadInit(){
  const lazyImages = document.querySelectorAll('img.lazy-img[data-src]');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const img = entry.target;
          const src = img.dataset.src;
          if(!src) { obs.unobserve(img); return; }
          // Add load handler so we only remove the placeholder class after the real image has loaded
          const onLoad = function() {
            img.removeAttribute('data-src');
            img.classList.remove('lazy-img');
            img.removeEventListener('load', onLoad);
          };
          img.addEventListener('load', onLoad);
          // Set src to begin loading the higher-res image
          img.src = src;
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });
    lazyImages.forEach(img => io.observe(img));
  } else {
    // Fallback: load all immediately but still wait for load before removing class
    lazyImages.forEach(img => {
      const src = img.dataset.src;
      if(!src) return;
      const onLoad = function() {
        img.removeAttribute('data-src');
        img.classList.remove('lazy-img');
        img.removeEventListener('load', onLoad);
      };
      img.addEventListener('load', onLoad);
      img.src = src;
    });
  }
}

function setupFilters(){
  const sel = filterSelect;
  if(!sel) return;
  const cats = ['all', ...new Set(projects.map(p => p.category))];
  sel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
  sel.addEventListener('change', (e) => filterProjects(e.target.value));
}

function setupMenuToggle(){
  const btn = document.getElementById('menu-toggle');
  const navList = document.getElementById('nav-list');
  if(!btn || !navList) return;
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    navList.style.display = expanded ? 'none' : 'flex';
  });
}

function init(){
  setupMenuToggle();
  setupFilters();
  const list = document.getElementById('projects-list') || document.getElementById('projects-list-page');
  renderProjects(projects, list);
  if(newsletterForm) newsletterForm.addEventListener('submit', handleNewsletterSubmit);
}

document.addEventListener('DOMContentLoaded', init);
