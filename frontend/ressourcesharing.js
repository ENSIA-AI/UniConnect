document.addEventListener('DOMContentLoaded', function() {
const searchInput = document.getElementById('searchInput');
const itemsGrid = document.getElementById('itemsGrid');
loadModules();
function loadModules() {
let savedModules = JSON.parse(localStorage.getItem('uniconnectModules')) || [];
if (savedModules.length > 0) {
savedModules.forEach(module => {
addModuleCard(module);
});
}
}
function addModuleCard(moduleData) {
const card = document.createElement('a');
card.className = 'item-card';
card.href = moduleData.moduleLink;
card.target = '_blank';
card.rel = 'noopener noreferrer';
const imageUrl = moduleData.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop';
card.innerHTML = `
<div class="img-box">
<img src="${imageUrl}" alt="Module" onerror="this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'">
<div class="overlay">
<i class="fas fa-arrow-right"></i>
</div>
</div>
<div class="info">
<div class="title">Module: ${moduleData.moduleName}</div>
<div class="sub"><i class="fas fa-calendar-alt"></i> ${moduleData.semester} · Coefficient: ${moduleData.coefficient}</div>
<div class="owner-email"><i class="fas fa-user"></i> ${moduleData.ownerEmail}</div>
<div class="resources-count">
<i class="fas fa-file-alt"></i> ${moduleData.resourcesCount || 0} Resources Available
</div>
</div>
`;
itemsGrid.appendChild(card);
}
searchInput.addEventListener('input', function() {
const searchTerm = this.value.toLowerCase().trim();
const allCards = itemsGrid.querySelectorAll('.item-card');
allCards.forEach(card => {
const title = card.querySelector('.title').textContent.toLowerCase();
const sub = card.querySelector('.sub').textContent.toLowerCase();
const email = card.querySelector('.owner-email').textContent.toLowerCase();
if (title.includes(searchTerm) || sub.includes(searchTerm) || email.includes(searchTerm)) {
card.style.display = 'block';
card.style.animation = 'fadeIn 0.3s ease';
} else {
card.style.display = 'none';
}
});
const visibleCards = Array.from(allCards).filter(card => card.style.display !== 'none');
let noResultsMsg = document.getElementById('noResultsMsg');
if (visibleCards.length === 0) {
if (!noResultsMsg) {
noResultsMsg = document.createElement('div');
noResultsMsg.id = 'noResultsMsg';
noResultsMsg.style.cssText = `
text-align: center;
padding: 40px;
color: #6c757d;
font-size: 1.1rem;
grid-column: 1 / -1;
`;
noResultsMsg.innerHTML = '<i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>No modules found matching your search.';
itemsGrid.appendChild(noResultsMsg);
}
} else {
if (noResultsMsg) {
noResultsMsg.remove();
}
}
});
});
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
from {
opacity: 0;
transform: translateY(10px);
}
to {
opacity: 1;
transform: translateY(0);
}
}
`;
document.head.appendChild(style);
