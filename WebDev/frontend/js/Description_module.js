
document.addEventListener('DOMContentLoaded', async function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Please sign in to access this page');
        window.location.href = 'signin.html';
        return;
    }

    // Get module ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('id');
    
    if (!moduleId) {
        alert('No module specified');
        window.location.href = 'resourcesharing.html';
        return;
    }

    await loadModuleDetails(moduleId);
    setupRatingSystem(moduleId);
});

async function loadModuleDetails(moduleId) {
    try {
        const module = await apiCall(API_ENDPOINTS.MODULES.GET_ONE(moduleId));
        
        // Display module information
        document.getElementById('moduleName').textContent = module.module_name;
        document.getElementById('moduleSemester').textContent = module.semester;
        document.getElementById('moduleCoefficient').textContent = module.coefficient;
        document.getElementById('moduleOwner').textContent = module.owner_email;
        document.getElementById('moduleDescription').textContent = module.description || 'No description available';
        document.getElementById('resourcesCount').textContent = module.resources_count || 0;
        
        // Display module image
        const moduleImage = document.getElementById('moduleImage');
        if (moduleImage) {
            moduleImage.src = module.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop';
        }
        
        // Display average rating
        const averageRating = parseFloat(module.average_rating || 0);
        displayAverageRating(averageRating, module.rating_count || 0);
        
        // Module link button
        const moduleLinkBtn = document.getElementById('moduleLinkBtn');
        if (moduleLinkBtn) {
            moduleLinkBtn.onclick = () => window.open(module.module_link, '_blank');
        }
        
    } catch (error) {
        console.error('Error loading module:', error);
        alert('Failed to load module details');
        window.location.href = 'resourcesharing.html';
    }
}

function displayAverageRating(average, count) {
    const ratingDisplay = document.getElementById('averageRating');
    const ratingCount = document.getElementById('ratingCount');
    
    if (ratingDisplay) {
        ratingDisplay.innerHTML = `
            <span class="rating-stars">${getStarsHTML(average)}</span>
            <span class="rating-number">${average.toFixed(1)}</span>
        `;
    }
    
    if (ratingCount) {
        ratingCount.textContent = `(${count} rating${count !== 1 ? 's' : ''})`;
    }
}

function getStarsHTML(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function setupRatingSystem(moduleId) {
    const stars = document.querySelectorAll('.rating-star');
    const submitBtn = document.getElementById('submitRating');
    let selectedRating = 0;
    
    stars.forEach((star, index) => {
        star.addEventListener('click', function() {
            selectedRating = index + 1;
            updateStarDisplay(selectedRating);
        });
        
        star.addEventListener('mouseenter', function() {
            updateStarDisplay(index + 1);
        });
    });
    
    const ratingContainer = document.querySelector('.rating-stars');
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseleave', function() {
            updateStarDisplay(selectedRating);
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', async function() {
            if (selectedRating === 0) {
                alert('Please select a rating');
                return;
            }
            
            await submitRating(moduleId, selectedRating);
        });
    }
}

function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

async function submitRating(moduleId, rating) {
    try {
        await apiCall(API_ENDPOINTS.MODULES.RATE, {
            method: 'POST',
            body: JSON.stringify({
                module_id: moduleId,
                rating: rating
            })
        });
        
        // Show confetti animation
        showConfetti();
        
        // Show success message
        showSuccessMessage('Rating submitted successfully!');
        
        // Reload module to show updated rating
        setTimeout(() => {
            loadModuleDetails(moduleId);
        }, 2000);
        
    } catch (error) {
        console.error('Error submitting rating:', error);
        alert('Failed to submit rating: ' + error.message);
    }
}

function showConfetti() {
    // Simple confetti effect
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
    `;
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${getRandomColor()};
            top: -10px;
            left: ${Math.random() * 100}%;
            animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
        `;
        confettiContainer.appendChild(confetti);
    }
    
    document.body.appendChild(confettiContainer);
    
    setTimeout(() => {
        confettiContainer.remove();
    }, 4000);
}

function getRandomColor() {
    const colors = ['#7C3AED', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #10B981;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        to {
            transform: translateY(100vh) rotate(360deg);
        }
    }
    
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
