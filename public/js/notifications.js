// Notification System
let notificationCount = 0;
let notificationInterval;
const notificationBell = document.querySelector('.notification-bell');
const notificationDropdown = document.querySelector('.notification-dropdown');
const notificationList = document.querySelector('.notification-list');
const markAllReadBtn = document.querySelector('.mark-all-read-btn');

// Initialize WebSocket Connection
const ws = new WebSocket(`ws://${window.location.host}/ws/notifications`);

ws.onmessage = function(event) {
    const notification = JSON.parse(event.data);
    addNewNotification(notification);
    updateNotificationCount();
    showNotificationToast(notification);
};

ws.onclose = function() {
    console.log('WebSocket connection closed');
    // Attempt to reconnect after 5 seconds
    setTimeout(() => {
        window.location.reload();
    }, 5000);
};

// Load Initial Notifications
async function loadNotifications() {
    try {
        const response = await fetch('/notifications');
        const data = await response.json();

        if (data.success) {
            notificationCount = data.unreadCount;
            updateNotificationCount();
            renderNotifications(data.notifications);
        }
    } catch (error) {
        console.error('Failed to load notifications:', error);
    }
}

// Render Notifications
function renderNotifications(notifications) {
    if (!notificationList) return;

    if (notifications.length === 0) {
        notificationList.innerHTML = `
            <div class="no-notifications">
                <i class="fas fa-bell-slash"></i>
                <p>No notifications yet</p>
            </div>
        `;
        return;
    }

    const notificationsHTML = notifications.map(notification => `
        <div class="notification-item ${notification.read ? '' : 'unread'}" 
             data-notification-id="${notification._id}">
            <div class="notification-icon">
                <i class="fas ${getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <p>${notification.message}</p>
                <small>${formatTimeAgo(notification.createdAt)}</small>
            </div>
            ${notification.read ? '' : '<div class="unread-dot"></div>'}
        </div>
    `).join('');

    notificationList.innerHTML = notificationsHTML;
}

// Add New Notification
function addNewNotification(notification) {
    if (!notificationList) return;

    const notificationElement = document.createElement('div');
    notificationElement.className = `notification-item unread`;
    notificationElement.dataset.notificationId = notification._id;
    notificationElement.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${getNotificationIcon(notification.type)}"></i>
        </div>
        <div class="notification-content">
            <p>${notification.message}</p>
            <small>Just now</small>
        </div>
        <div class="unread-dot"></div>
    `;

    notificationList.insertBefore(notificationElement, notificationList.firstChild);
    showNotificationAnimation(notificationElement);
}

// Show Notification Animation
function showNotificationAnimation(element) {
    element.style.animation = 'slideIn 0.3s ease-out';
    setTimeout(() => {
        element.style.animation = '';
    }, 300);
}

// Get Notification Icon
function getNotificationIcon(type) {
    const icons = {
        like: 'fa-heart',
        comment: 'fa-comment',
        follow: 'fa-user-plus',
        mention: 'fa-at',
        system: 'fa-info-circle'
    };
    return icons[type] || 'fa-bell';
}

// Format Time Ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
        return `${minutes}m ago`;
    } else if (hours < 24) {
        return `${hours}h ago`;
    } else {
        return `${days}d ago`;
    }
}

// Update Notification Count
function updateNotificationCount() {
    if (!notificationBell) return;

    const countBadge = notificationBell.querySelector('.notification-count');
    if (countBadge) {
        countBadge.textContent = notificationCount;
        countBadge.style.display = notificationCount > 0 ? 'block' : 'none';
    }
}

// Show Notification Toast
function showNotificationToast(notification) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
        new Notification('New Notification', {
            body: notification.message,
            icon: '/images/logo.png'
        });
    }
}

// Mark Notification as Read
async function markAsRead(notificationId) {
    try {
        const response = await fetch(`/notifications/${notificationId}/read`, {
            method: 'PUT'
        });

        const data = await response.json();
        
        if (data.success) {
            const notification = document.querySelector(`[data-notification-id="${notificationId}"]`);
            if (notification) {
                notification.classList.remove('unread');
                notification.querySelector('.unread-dot')?.remove();
                notificationCount--;
                updateNotificationCount();
            }
        }
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
}

// Mark All Notifications as Read
if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', async function() {
        try {
            const response = await fetch('/notifications/read-all', {
                method: 'PUT'
            });

            const data = await response.json();
            
            if (data.success) {
                document.querySelectorAll('.notification-item.unread').forEach(item => {
                    item.classList.remove('unread');
                    item.querySelector('.unread-dot')?.remove();
                });
                notificationCount = 0;
                updateNotificationCount();
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    });
}

// Notification Click Handler
if (notificationList) {
    notificationList.addEventListener('click', function(e) {
        const notificationItem = e.target.closest('.notification-item');
        if (notificationItem) {
            const notificationId = notificationItem.dataset.notificationId;
            if (notificationItem.classList.contains('unread')) {
                markAsRead(notificationId);
            }
            
            // Handle notification click (e.g., navigate to relevant page)
            const link = notificationItem.dataset.link;
            if (link) {
                window.location.href = link;
            }
        }
    });
}

// Toggle Notification Dropdown
if (notificationBell && notificationDropdown) {
    notificationBell.addEventListener('click', function(e) {
        e.stopPropagation();
        notificationDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!notificationDropdown.contains(e.target) && !notificationBell.contains(e.target)) {
            notificationDropdown.classList.remove('show');
        }
    });
}

// Request Notification Permission
if ('Notification' in window) {
    Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
            console.log('Notification permission granted');
        }
    });
}

// Initialize
loadNotifications(); 