document.addEventListener('DOMContentLoaded',function(){
const form=document.querySelector('form');
const emailInput=document.querySelector('input[type="email"]');
const passwordInput=document.querySelector('input[type="password"]');
const signinBtn=document.querySelector('.signin-btn');
const emailRegex=/^[a-zA-Z]+\.[a-zA-Z]+@ensia\.edu\.dz$/;
function validateEmail(email){
return emailRegex.test(email);
}
function showError(input,message){
const existingError=input.parentElement.querySelector('.error-message');
if(existingError){
existingError.remove();
}
input.style.borderColor='#dc3545';
const errorDiv=document.createElement('div');
errorDiv.className='error-message';
errorDiv.textContent=message;
errorDiv.style.color='#dc3545';
errorDiv.style.fontSize='12px';
errorDiv.style.marginTop='5px';
errorDiv.style.textAlign='left';
input.parentElement.appendChild(errorDiv);
}
function clearError(input){
const existingError=input.parentElement.querySelector('.error-message');
if(existingError){
existingError.remove();
}
input.style.borderColor='#ccc';
}
emailInput.addEventListener('input',function(){
clearError(emailInput);
});
passwordInput.addEventListener('input',function(){
clearError(passwordInput);
});
signinBtn.addEventListener('click',function(e){
e.preventDefault();
let isValid=true;
clearError(emailInput);
clearError(passwordInput);
if(!emailInput.value.trim()){
showError(emailInput,'Email is required');
isValid=false;
}else if(!validateEmail(emailInput.value)){
showError(emailInput,'Email must be in format: firstname.lastname@ensia.edu.dz');
isValid=false;
}
if(!passwordInput.value){
showError(passwordInput,'Password is required');
isValid=false;
}else if(passwordInput.value.length<6){
showError(passwordInput,'Password must be at least 6 characters');
isValid=false;
}
if(isValid){
console.log('Sign in successful');
window.location.href='home.html';
}
});
emailInput.addEventListener('keypress',function(e){
if(e.key==='Enter'){
signinBtn.click();
}
});
passwordInput.addEventListener('keypress',function(e){
if(e.key==='Enter'){
signinBtn.click();
}
});
});