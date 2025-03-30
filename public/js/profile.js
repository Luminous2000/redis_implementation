// Profile Form Handling
const profileForm = document.querySelector('.profile-form');
if (profileForm) {
    const avatarInput = profileForm.querySelector('input[type="file"]');
    const avatarPreview = document.querySelector('.avatar-preview');
    const currentPasswordInput = profileForm.querySelector('input[name="currentPassword"]');
    const newPasswordInput = profileForm.querySelector('input[name="newPassword"]');
    const confirmPasswordInput = profileForm.querySelector('input[name="confirmPassword"]');

    // Avatar Preview
    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    showAlert('error', 'Image size should be less than 5MB');
                    this.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.style.backgroundImage = `url(${e.target.result})`;
                    avatarPreview.classList.remove('d-none');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Password Validation
    if (newPasswordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value !== newPasswordInput.value) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    // Form Submission
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const userId = this.dataset.userId;

        try {
            const response = await fetch(`/profile/${userId}`, {
                method: 'PUT',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                showAlert('success', 'Profile updated successfully');
                if (data.avatar) {
                    document.querySelector('.navbar-avatar').style.backgroundImage = `url(${data.avatar})`;
                }
            } else {
                showAlert('error', data.message || 'Failed to update profile');
            }
        } catch (error) {
            showAlert('error', 'An error occurred. Please try again later.');
        }
    });
}

// Profile Stats
const statsContainer = document.querySelector('.profile-stats');
if (statsContainer) {
    const userId = statsContainer.dataset.userId;
    
    async function loadProfileStats() {
        try {
            const response = await fetch(`/profile/${userId}/stats`);
            const data = await response.json();

            if (data.success) {
                updateStatsDisplay(data.stats);
            }
        } catch (error) {
            console.error('Failed to load profile stats:', error);
        }
    }

    function updateStatsDisplay(stats) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <i class="fas fa-file-alt"></i>
                <span class="stat-value">${stats.posts}</span>
                <span class="stat-label">Posts</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-heart"></i>
                <span class="stat-value">${stats.likes}</span>
                <span class="stat-label">Likes</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-comments"></i>
                <span class="stat-value">${stats.comments}</span>
                <span class="stat-label">Comments</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-users"></i>
                <span class="stat-value">${stats.followers}</span>
                <span class="stat-label">Followers</span>
            </div>
        `;
    }

    loadProfileStats();
}

// Follow/Unfollow Functionality
const followButton = document.querySelector('.follow-btn');
if (followButton) {
    followButton.addEventListener('click', async function() {
        const userId = this.dataset.userId;
        const isFollowing = this.classList.contains('following');
        
        try {
            const response = await fetch(`/profile/${userId}/follow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: isFollowing ? 'unfollow' : 'follow' })
            });

            const data = await response.json();
            
            if (data.success) {
                this.classList.toggle('following');
                this.textContent = isFollowing ? 'Follow' : 'Following';
                updateFollowerCount(data.followers);
            } else {
                showAlert('error', data.message || 'Failed to update follow status');
            }
        } catch (error) {
            showAlert('error', 'An error occurred. Please try again later.');
        }
    });
}

function updateFollowerCount(count) {
    const followerCount = document.querySelector('.follower-count');
    if (followerCount) {
        followerCount.textContent = count;
    }
}

// User Posts Pagination
const postsContainer = document.querySelector('.user-posts');
if (postsContainer) {
    let currentPage = 1;
    let isLoading = false;
    const loadMoreTrigger = document.querySelector('.load-more-trigger');
    const userId = postsContainer.dataset.userId;

    if (loadMoreTrigger) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isLoading) {
                    loadMorePosts();
                }
            });
        });

        observer.observe(loadMoreTrigger);
    }

    async function loadMorePosts() {
        isLoading = true;
        currentPage++;

        try {
            const response = await fetch(`/profile/${userId}/posts?page=${currentPage}`);
            const data = await response.json();

            if (data.success) {
                appendPosts(data.posts);
                if (!data.hasMore) {
                    loadMoreTrigger.style.display = 'none';
                }
            } else {
                showAlert('error', data.message || 'Failed to load more posts');
            }
        } catch (error) {
            showAlert('error', 'An error occurred. Please try again later.');
        } finally {
            isLoading = false;
        }
    }

    function appendPosts(posts) {
        const postsHTML = posts.map(post => `
            <div class="post-card">
                <div class="post-header">
                    <img src="${post.author.avatar || '/images/default-avatar.png'}" 
                         alt="${post.author.name}" 
                         class="avatar">
                    <div class="post-info">
                        <h5>${post.author.name}</h5>
                        <small>${new Date(post.createdAt).toLocaleString()}</small>
                    </div>
                </div>
                <h3>${post.title}</h3>
                <p>${post.content.substring(0, 150)}...</p>
                <div class="post-footer">
                    <button class="like-btn ${post.isLiked ? 'liked' : ''}" data-post-id="${post._id}">
                        <i class="fas fa-heart"></i>
                        <span class="like-count">${post.likes}</span>
                    </button>
                    <a href="/posts/${post._id}" class="btn btn-primary">Read More</a>
                </div>
            </div>
        `).join('');

        postsContainer.insertAdjacentHTML('beforeend', postsHTML);
    }
}

// Alert Helper Function
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 5000);
} 