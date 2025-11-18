const moduleData = {
name: "Data Structures",
semester: "Semester 3",
coefficient: 4,
owner: "ahmed.benali@ensia.edu.dz",
resourceCount: 24,
description: "This module covers fundamental data structures including arrays, linked lists, stacks, queues, trees, and graphs. Students will learn to analyze time and space complexity, implement various data structures, and choose appropriate structures for different programming scenarios.",
driveLink: "https://drive.google.com/drive/folders/example",
ratings: {
average: 4.2,
count: 48,
userRatings: [5, 4, 5, 3, 4, 5, 4, 4, 5, 3, 4, 5, 4, 4, 5, 4, 3, 5, 4, 4, 5, 4, 4, 3, 5, 4, 5, 4, 4, 5, 3, 4, 5, 4, 4, 5, 4, 3, 5, 4, 4, 5, 4, 4, 3, 5, 4, 5]
}
};
document.addEventListener('DOMContentLoaded', function() {
loadModuleData();
initializeRatingSystem();
checkUserRating();
});
function loadModuleData() {
document.getElementById('moduleName').textContent = moduleData.name;
document.getElementById('semester').textContent = moduleData.semester;
document.getElementById('coefficient').textContent = moduleData.coefficient;
document.getElementById('ownerEmail').textContent = moduleData.owner;
document.getElementById('resourceCount').textContent = `${moduleData.resourceCount} Available`;
document.getElementById('moduleDescription').textContent = moduleData.description;
document.getElementById('resourcesLink').href = moduleData.driveLink;
updateAverageRating();
}
function updateAverageRating() {
const avgRating = moduleData.ratings.average;
const ratingCount = moduleData.ratings.count;
document.getElementById('averageRating').textContent = avgRating.toFixed(1);
document.getElementById('ratingCount').textContent = ratingCount;
const starsDisplay = document.getElementById('averageStarsDisplay');
starsDisplay.innerHTML = generateStarHTML(avgRating);
}
function generateStarHTML(rating) {
let html = '';
const fullStars = Math.floor(rating);
const hasHalfStar = rating % 1 >= 0.5;
const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
for (let i = 0; i < fullStars; i++) {
html += '<i class="fas fa-star"></i>';
}
if (hasHalfStar) {
html += '<i class="fas fa-star-half-alt"></i>';
}
for (let i = 0; i < emptyStars; i++) {
html += '<i class="far fa-star"></i>';
}
return html;
}
function initializeRatingSystem() {
const stars = document.querySelectorAll('.star-rating i');
const submitBtn = document.getElementById('submitRatingBtn');
let selectedRating = 0;
stars.forEach((star, index) => {
star.addEventListener('mouseenter', function() {
highlightStars(index + 1);
});
star.addEventListener('click', function() {
selectedRating = parseInt(this.getAttribute('data-rating'));
selectStars(selectedRating);
updateRatingText(selectedRating);
submitBtn.disabled = false;
});
});
document.querySelector('.star-rating').addEventListener('mouseleave', function() {
if (selectedRating > 0) {
selectStars(selectedRating);
} else {
resetStars();
}
});
submitBtn.addEventListener('click', function() {
submitRating(selectedRating);
});
}
function highlightStars(count) {
const stars = document.querySelectorAll('.star-rating i');
stars.forEach((star, index) => {
if (index < count) {
star.classList.add('hover');
} else {
star.classList.remove('hover');
}
});
}
function selectStars(count) {
const stars = document.querySelectorAll('.star-rating i');
stars.forEach((star, index) => {
star.classList.remove('hover');
if (index < count) {
star.classList.remove('far');
star.classList.add('fas', 'selected');
} else {
star.classList.remove('fas', 'selected');
star.classList.add('far');
}
});
}
function resetStars() {
const stars = document.querySelectorAll('.star-rating i');
stars.forEach(star => {
star.classList.remove('fas', 'selected', 'hover');
star.classList.add('far');
});
}
function updateRatingText(rating) {
const ratingText = document.getElementById('ratingText');
const difficultyLevels = {
1: "Very Easy ⭐",
2: "Easy ⭐⭐",
3: "Moderate ⭐⭐⭐",
4: "Challenging ⭐⭐⭐⭐",
5: "Very Challenging ⭐⭐⭐⭐⭐"
};
ratingText.textContent = difficultyLevels[rating];
ratingText.classList.add('has-rating');
}
function submitRating(rating) {
moduleData.ratings.userRatings.push(rating);
moduleData.ratings.count++;
const sum = moduleData.ratings.userRatings.reduce((a, b) => a + b, 0);
moduleData.ratings.average = sum / moduleData.ratings.userRatings.length;
updateAverageRating();
localStorage.setItem('userRated_' + moduleData.name, rating);
const successMessage = document.getElementById('successMessage');
successMessage.classList.add('show');
document.querySelector('.user-rating').style.opacity = '0.6';
document.querySelector('.user-rating').style.pointerEvents = 'none';
document.getElementById('submitRatingBtn').disabled = true;
celebrateRating();
setTimeout(() => {
successMessage.classList.remove('show');
}, 3000);
}
function checkUserRating() {
const userRating = localStorage.getItem('userRated_' + moduleData.name);
if (userRating) {
const rating = parseInt(userRating);
selectStars(rating);
updateRatingText(rating);
document.querySelector('.user-rating').style.opacity = '0.6';
document.querySelector('.user-rating').style.pointerEvents = 'none';
document.getElementById('submitRatingBtn').disabled = true;
const ratingPrompt = document.querySelector('.rating-prompt');
ratingPrompt.textContent = 'You have already rated this module:';
ratingPrompt.style.color = '#6c757d';
}
}
function celebrateRating() {
const container = document.querySelector('.rating-section');
for (let i = 0; i < 30; i++) {
setTimeout(() => {
createConfetti(container);
}, i * 50);
}
}
function createConfetti(container) {
const confetti = document.createElement('div');
confetti.style.cssText = `
position: absolute;
width: 10px;
height: 10px;
background-color: ${['#F59E0B', '#7C3AED', '#A78BFA', '#FCD34D'][Math.floor(Math.random() * 4)]};
left: ${Math.random() * 100}%;
top: 0;
border-radius: 50%;
pointer-events: none;
animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
z-index: 1000;
`;
container.style.position = 'relative';
container.style.overflow = 'hidden';
container.appendChild(confetti);
setTimeout(() => {
confetti.remove();
}, 4000);
}
const style = document.createElement('style');
style.textContent = `
@keyframes confettiFall {
0% {
transform: translateY(0) rotate(0deg);
opacity: 1;
}
100% {
transform: translateY(500px) rotate(360deg);
opacity: 0;
}
}
`;
document.head.appendChild(style);