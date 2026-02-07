
document.addEventListener('DOMContentLoaded', async function() {
    await loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        // Fetch from individual endpoints
        const [modules, marketplace, studyGroups, lostFound, todos] = await Promise.all([
            apiCall(API_ENDPOINTS.MODULES.GET_ALL).catch(() => []),
            apiCall(API_ENDPOINTS.MARKETPLACE.GET_ALL).catch(() => []),
            apiCall(API_ENDPOINTS.STUDY_GROUPS.GET_ALL).catch(() => []),
            apiCall(API_ENDPOINTS.LOST_FOUND.GET_ALL).catch(() => []),
            apiCall(API_ENDPOINTS.TODOS.GET_ALL).catch(() => [])
        ]);
        
        // Update stat cards with real data
        updateStatCard('totalModules', modules.length);
        updateStatCard('marketplaceItems', marketplace.length);
        updateStatCard('studyGroups', studyGroups.length);
        updateStatCard('lostFoundItems', lostFound.length);
        updateStatCard('totalTodos', todos.length);
        
        // Calculate active users (unique emails from all endpoints)
        const uniqueUsers = new Set();
        modules.forEach(m => m.owner_email && uniqueUsers.add(m.owner_email));
        marketplace.forEach(m => m.seller_email && uniqueUsers.add(m.seller_email));
        studyGroups.forEach(m => m.contact_email && uniqueUsers.add(m.contact_email));
        lostFound.forEach(m => m.contact_email && uniqueUsers.add(m.contact_email));
        updateStatCard('activeUsers', uniqueUsers.size);
        
        // Update stat trends with dynamic information
        updateStatTrends({ modules, marketplace, studyGroups, lostFound, todos, uniqueUsers: uniqueUsers.size });
        
        // Calculate and update platform activity metrics
        updatePlatformMetrics({ modules, marketplace, studyGroups, lostFound, todos });
        
        // Update recent activity feed
        updateRecentActivity({ modules, marketplace, studyGroups, lostFound, todos });
        
        // Update charts with real data
        updateCharts({ modules, marketplace, studyGroups, lostFound, todos });
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        animateValue(element, 0, value, 1000);
    }
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = Math.round(end).toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current).toLocaleString();
        }
    }, 16);
}

function updateStatTrends(data) {
    // Active Users trend
    const usersTrend = document.getElementById('activeUsersTrend');
    if (usersTrend) {
        usersTrend.querySelector('span').textContent = 
            `${data.uniqueUsers} active contributor${data.uniqueUsers !== 1 ? 's' : ''}`;
    }
    
    // Modules trend
    const modulesTrend = document.getElementById('modulesTrend');
    if (modulesTrend) {
        modulesTrend.querySelector('span').textContent = 
            `${data.modules.length} module${data.modules.length !== 1 ? 's' : ''} shared`;
    }
    
    // Lost & Found trend - calculate recovery rate
    const lostFoundTrend = document.getElementById('lostFoundTrend');
    if (lostFoundTrend) {
        const foundItems = data.lostFound.filter(item => item.status === 'found').length;
        const totalItems = data.lostFound.length;
        const recoveryRate = totalItems > 0 ? Math.round((foundItems / totalItems) * 100) : 0;
        lostFoundTrend.querySelector('span').textContent = `${recoveryRate}% recovery rate`;
    }
    
    // Study Groups trend
    const studyGroupsTrend = document.getElementById('studyGroupsTrend');
    if (studyGroupsTrend) {
        studyGroupsTrend.querySelector('span').textContent = 
            `${data.studyGroups.length} group${data.studyGroups.length !== 1 ? 's' : ''} active`;
    }
    
    // Marketplace trend
    const marketplaceTrend = document.getElementById('marketplaceTrend');
    if (marketplaceTrend) {
        const availableItems = data.marketplace.filter(item => item.status === 'available').length;
        marketplaceTrend.querySelector('span').textContent = 
            `${availableItems} item${availableItems !== 1 ? 's' : ''} for sale`;
    }
    
    // Todos trend
    const todosTrend = document.getElementById('todosTrend');
    if (todosTrend) {
        const completedTodos = data.todos.filter(todo => todo.completed).length;
        const totalTodos = data.todos.length;
        const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
        todosTrend.querySelector('span').textContent = 
            `${completionRate}% completion rate`;
    }
}

function updatePlatformMetrics(data) {
    // Calculate metrics based on actual data
    const totalItems = 20; // Target number for 100%
    
    // Marketplace Activity: percentage of available items
    const marketplaceActivity = data.marketplace.length > 0 
        ? Math.min((data.marketplace.length / totalItems) * 100, 100) 
        : 0;
    updateProgressBar('marketplaceBar', 'marketplacePercentage', marketplaceActivity);
    
    // Resource Sharing Engagement: percentage based on modules
    const resourceSharing = data.modules.length > 0 
        ? Math.min((data.modules.length / 15) * 100, 100) 
        : 0;
    updateProgressBar('resourceSharingBar', 'resourceSharingPercentage', resourceSharing);
    
    // Study Group Participation: percentage based on study groups
    const studyGroupActivity = data.studyGroups.length > 0 
        ? Math.min((data.studyGroups.length / 20) * 100, 100) 
        : 0;
    updateProgressBar('studyGroupBar', 'studyGroupPercentage', studyGroupActivity);
    
    // To-Do List Usage: percentage based on todos
    const todoUsage = data.todos.length > 0 
        ? Math.min((data.todos.length / 30) * 100, 100) 
        : 0;
    updateProgressBar('todoBar', 'todoPercentage', todoUsage);
}

function updateProgressBar(barId, percentageId, value) {
    const bar = document.getElementById(barId);
    const percentage = document.getElementById(percentageId);
    
    if (bar && percentage) {
        const roundedValue = Math.round(value);
        bar.setAttribute('data-width', roundedValue);
        percentage.textContent = roundedValue + '%';
        
        // Animate the bar
        setTimeout(() => {
            bar.style.width = roundedValue + '%';
        }, 500);
    }
}

function updateRecentActivity(data) {
    const container = document.getElementById('activityContainer');
    if (!container) return;
    
    const activities = [];
    
    // Add recent modules (latest 2)
    data.modules.slice(-2).reverse().forEach(module => {
        activities.push({
            icon: 'book',
            iconClass: 'info',
            title: 'New Module Added',
            description: `${module.module_name} resources uploaded`,
            time: formatTimeAgo(module.created_at)
        });
    });
    
    // Add recent marketplace items (latest 2)
    data.marketplace.slice(-2).reverse().forEach(item => {
        activities.push({
            icon: 'shopping-cart',
            iconClass: 'success',
            title: 'Marketplace Item Listed',
            description: `${item.title} - $${item.price}`,
            time: formatTimeAgo(item.created_at)
        });
    });
    
    // Add recent study groups (latest 2)
    data.studyGroups.slice(-2).reverse().forEach(group => {
        activities.push({
            icon: 'users',
            iconClass: 'warning',
            title: 'Study Group Created',
            description: `${group.module_name} group formed`,
            time: formatTimeAgo(group.created_at)
        });
    });
    
    // Add recent lost & found (latest 2)
    data.lostFound.slice(-2).reverse().forEach(item => {
        const iconClass = item.status === 'found' ? 'success' : 'warning';
        const title = item.status === 'found' ? 'Item Found' : 'Item Lost';
        activities.push({
            icon: 'search',
            iconClass: iconClass,
            title: title,
            description: `${item.title} - ${item.location}`,
            time: formatTimeAgo(item.created_at)
        });
    });
    
    // Sort by time (most recent first) and take top 5
    const sortedActivities = activities.slice(0, 5);
    
    // Clear container and populate with activities
    container.innerHTML = '';
    
    if (sortedActivities.length === 0) {
        container.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon info">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">No Recent Activity</div>
                    <div class="activity-time">Start using the platform to see activities here</div>
                </div>
            </div>
        `;
        return;
    }
    
    sortedActivities.forEach(activity => {
        const activityHTML = `
            <div class="activity-item">
                <div class="activity-icon ${activity.iconClass}">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.description} - ${activity.time}</div>
                </div>
            </div>
        `;
        container.innerHTML += activityHTML;
    });
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return 'recently';
    
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return past.toLocaleDateString();
}

function updateCharts(data) {
    // Update Lost & Found pie chart
    updateLostFoundChart(data.lostFound);
    
    // Update Module bar chart by semester
    updateModuleChart(data.modules);
}

function updateLostFoundChart(lostFoundItems) {
    const canvas = document.getElementById('lostFoundChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Count items by status
    const foundCount = lostFoundItems.filter(item => item.status === 'found').length;
    const lostCount = lostFoundItems.filter(item => item.status === 'lost').length;
    const total = lostFoundItems.length;
    
    // If no data, draw a gray circle with "No Data" text
    if (total === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#E5E7EB';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw "No Data" text
        ctx.fillStyle = '#6B7280';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No Data', centerX, centerY);
    } else {
        // Draw pie chart with data
        const data = [
            { label: 'Items Found', value: foundCount, color: '#10B981' },
            { label: 'Items Lost', value: lostCount, color: '#F59E0B' }
        ];
        
        let currentAngle = -Math.PI / 2;
        
        data.forEach(item => {
            if (item.value > 0) {
                const sliceAngle = (item.value / total) * 2 * Math.PI;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.lineTo(centerX, centerY);
                ctx.fillStyle = item.color;
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                currentAngle += sliceAngle;
            }
        });
    }
    
    // Update legend
    const legend = document.getElementById('lostFoundLegend');
    if (legend) {
        legend.innerHTML = '';
        
        if (total === 0) {
            legend.innerHTML = `
                <div class="legend-item">
                    <div class="legend-color" style="background: #E5E7EB"></div>
                    <span class="legend-label">No items yet</span>
                    <span class="legend-value">0.0%</span>
                </div>
            `;
        } else {
            const data = [
                { label: 'Items Found', value: foundCount, color: '#10B981' },
                { label: 'Items Lost', value: lostCount, color: '#F59E0B' },
                { label: 'Pending', value: 0, color: '#6B7280' }
            ];
            
            data.forEach(item => {
                const percentage = ((item.value / total) * 100).toFixed(1);
                legend.innerHTML += `
                    <div class="legend-item">
                        <div class="legend-color" style="background: ${item.color}"></div>
                        <span class="legend-label">${item.label}</span>
                        <span class="legend-value">${percentage}%</span>
                    </div>
                `;
            });
        }
    }
}

function updateModuleChart(modules) {
    const container = document.getElementById('moduleChart');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Count modules by semester
    const semesterCounts = {
        'Sem 1': 0,
        'Sem 2': 0,
        'Sem 3': 0,
        'Sem 4': 0,
        'Sem 5': 0
    };
    
    modules.forEach(module => {
        let sem = module.semester;
        
        // Normalize different semester formats to match our keys
        if (sem) {
            // Handle formats like "1", "2", etc.
            if (sem.match(/^\d$/)) {
                sem = `Sem ${sem}`;
            }
            // Handle formats like "Semester 1", "Semester 2", etc.
            else if (sem.match(/^Semester\s+(\d)$/i)) {
                sem = sem.replace(/^Semester\s+(\d)$/i, 'Sem $1');
            }
            
            if (semesterCounts.hasOwnProperty(sem)) {
                semesterCounts[sem]++;
            }
        }
    });
    
    const maxValue = Math.max(...Object.values(semesterCounts), 1);
    const hasData = modules.length > 0;
    
    Object.entries(semesterCounts).forEach(([label, value]) => {
        // Calculate height (minimum 20px for visibility even when value is 0)
        const heightPercentage = maxValue > 0 ? (value / maxValue) : 0;
        const height = value > 0 ? Math.max((heightPercentage * 160), 20) : 5; // Max height 160px, min 5px for zero
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = '0px';
        bar.style.opacity = value === 0 ? '0.3' : '1'; // Make zero bars more transparent
        bar.innerHTML = `
            <div class="bar-value">${value}</div>
            <div class="bar-label">${label}</div>
        `;
        container.appendChild(bar);
        
        // Animate bar height
        setTimeout(() => {
            bar.style.height = height + 'px';
        }, 200);
    });
    
    // Log for debugging (can be removed in production)
    if (modules.length > 0) {
        console.log('Module distribution by semester:', semesterCounts);
    }
}
