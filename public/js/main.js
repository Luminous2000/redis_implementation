// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('show');
            this.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.navbar') && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            mobileMenuToggle.classList.remove('active');
        }
    });
});

// Form Validation
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', function(event) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('is-invalid');
            } else {
                field.classList.remove('is-invalid');
            }
        });

        if (!isValid) {
            event.preventDefault();
            const firstInvalidField = form.querySelector('.is-invalid');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        }
    });
});

// Auto-resize Textareas
const textareas = document.querySelectorAll('textarea');
textareas.forEach(textarea => {
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
});

// Flash Messages Auto-hide
const alerts = document.querySelectorAll('.alert');
alerts.forEach(alert => {
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
    }, 5000);
});

// Image Preview
const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
imageInputs.forEach(input => {
    input.addEventListener('change', function() {
        const preview = document.querySelector('.image-preview');
        if (preview && this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.style.backgroundImage = `url(${e.target.result})`;
            };
            reader.readAsDataURL(this.files[0]);
        }
    });
});

// Infinite Scroll
let isLoading = false;
let currentPage = 1;
const loadMoreTrigger = document.querySelector('.load-more-trigger');

if (loadMoreTrigger) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
                loadMoreContent();
            }
        });
    });

    observer.observe(loadMoreTrigger);
}

async function loadMoreContent() {
    isLoading = true;
    currentPage++;

    try {
        const response = await fetch(`/api/posts?page=${currentPage}`);
        const data = await response.json();

        if (data.posts.length > 0) {
            const postsContainer = document.querySelector('.posts-grid');
            data.posts.forEach(post => {
                postsContainer.insertAdjacentHTML('beforeend', createPostCard(post));
            });
        } else {
            loadMoreTrigger.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading more posts:', error);
    } finally {
        isLoading = false;
    }
}

// Search Debounce
let searchTimeout;
const searchInput = document.querySelector('.search-input');

if (searchInput) {
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            this.form.submit();
        }, 500);
    });
}

// Helper Functions
function createPostCard(post) {
    return `
        <article class="post-card">
            <h3>${post.title}</h3>
            <div class="post-meta">
                <span class="author">
                    <i class="fas fa-user"></i> ${post.author}
                </span>
                <span class="date">
                    <i class="fas fa-calendar"></i> ${new Date(post.createdAt).toLocaleDateString()}
                </span>
            </div>
            <p class="post-excerpt">${post.content.substring(0, 150)}...</p>
            <a href="/posts/${post.id}" class="btn btn-link">Read More</a>
        </article>
    `;
} 