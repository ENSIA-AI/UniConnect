document.addEventListener('DOMContentLoaded', function() {
const form = document.getElementById('addModuleForm');
form.addEventListener('submit', function(e) {
e.preventDefault();
const formData = {
moduleName: document.getElementById('moduleName').value.trim(),
semester: document.getElementById('semester').value.trim(),
coefficient: document.getElementById('coefficient').value,
ownerEmail: document.getElementById('ownerEmail').value.trim(),
moduleLink: document.getElementById('moduleLink').value.trim(),
imageUrl: document.getElementById('imageUrl').value.trim(),
description: document.getElementById('description').value.trim()
};
if (!validateEnsiaEmail(formData.ownerEmail)) {
showError('Please use a valid ENSIA email address (firstname.lastname@ensia.edu.dz)');
return;
}
if (!isValidURL(formData.moduleLink)) {
showError('Please enter a valid URL for the module resources');
return;
}
if (formData.imageUrl && !isValidURL(formData.imageUrl)) {
showError('Please enter a valid URL for the module image');
return;
}
saveModule(formData);
showSuccess(formData);
setTimeout(() => {
window.location.href = 'ressourcesharing.html';
}, 2000);
});
const emailInput = document.getElementById('ownerEmail');
emailInput.addEventListener('blur', function() {
if (this.value && !validateEnsiaEmail(this.value)) {
this.style.borderColor = '#dc3545';
showError('Please use a valid ENSIA email format');
} else {
this.style.borderColor = '#ccc';
}
});
const urlInputs = [document.getElementById('moduleLink'), document.getElementById('imageUrl')];
urlInputs.forEach(input => {
input.addEventListener('blur', function() {
if (this.value && !isValidURL(this.value)) {
this.style.borderColor = '#dc3545';
} else {
this.style.borderColor = '#ccc';
}
});
});
});
function validateEnsiaEmail(email) {
const ensiaRegex = /^[a-z]+\.[a-z]+@ensia\.edu\.dz$/i;
return ensiaRegex.test(email);
}
function isValidURL(string) {
try {
const url = new URL(string);
return url.protocol === "http:" || url.protocol === "https:";
} catch (_) {
return false;
}
}
function saveModule(moduleData) {
let modules = JSON.parse(localStorage.getItem('uniconnectModules')) || [];
const newModule = {
id: Date.now(),
...moduleData,
resourcesCount: 0,
dateAdded: new Date().toISOString()
};
modules.push(newModule);
localStorage.setItem('uniconnectModules', JSON.stringify(modules));
console.log('Module saved successfully:', newModule);
}
function showError(message) {
const oldMessages = document.querySelectorAll('.error-message, .success-message');
oldMessages.forEach(msg => msg.remove());
const errorDiv = document.createElement('div');
errorDiv.className = 'error-message';
errorDiv.style.cssText = `
background-color: #f8d7da;
color: #721c24;
padding: 12px 20px;
border-radius: 8px;
margin-bottom: 20px;
border: 1px solid #f5c6cb;
text-align: center;
animation: slideDown 0.3s ease;
`;
errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
const formContainer = document.querySelector('.form-container');
formContainer.insertBefore(errorDiv, formContainer.firstChild);
window.scrollTo({ top: 0, behavior: 'smooth' });
setTimeout(() => errorDiv.remove(), 5000);
}
function showSuccess(moduleData) {
const oldMessages = document.querySelectorAll('.error-message, .success-message');
oldMessages.forEach(msg => msg.remove());
const successDiv = document.createElement('div');
successDiv.className = 'success-message';
successDiv.style.cssText = `
background-color: #d4edda;
color: #155724;
padding: 15px 20px;
border-radius: 8px;
margin-bottom: 20px;
border: 1px solid #c3e6cb;
text-align: center;
animation: slideDown 0.3s ease;
`;
successDiv.innerHTML = `
<i class="fas fa-check-circle" style="font-size: 1.5rem; display: block; margin-bottom: 8px;"></i>
<strong>Module "${moduleData.moduleName}" added successfully!</strong><br>
<small>Redirecting to Resource Sharing...</small>
`;
const formContainer = document.querySelector('.form-container');
formContainer.insertBefore(successDiv, formContainer.firstChild);
window.scrollTo({ top: 0, behavior: 'smooth' });
}
const style = document.createElement('style');
style.textContent = `
@keyframes slideDown {
from {
opacity: 0;
transform: translateY(-20px);
}
to {
opacity: 1;
transform: translateY(0);
}
}
`;
document.head.appendChild(style);