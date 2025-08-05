// Portfolio JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initContactForm();
    initProjectModals();
    initResumeDownload();
    initScrollEffects();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger menu
            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach((bar, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) bar.style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                    if (index === 1) bar.style.opacity = '0';
                    if (index === 2) bar.style.transform = 'rotate(45deg) translate(-5px, -6px)';
                } else {
                    bar.style.transform = '';
                    bar.style.opacity = '';
                }
            });
        });
    }

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu) {
                navMenu.classList.remove('active');
                const bars = navToggle ? navToggle.querySelectorAll('.bar') : [];
                bars.forEach(bar => {
                    bar.style.transform = '';
                    bar.style.opacity = '';
                });
            }
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation highlighting
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) return;
    
    const formFields = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        subject: document.getElementById('subject'),
        message: document.getElementById('message')
    };

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset previous errors
        clearErrors();
        
        // Validate form
        let isValid = true;
        const errors = {};

        // Name validation
        if (!formFields.name.value.trim()) {
            errors.name = 'Name is required';
            isValid = false;
        } else if (formFields.name.value.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formFields.email.value.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(formFields.email.value.trim())) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Subject validation
        if (!formFields.subject.value.trim()) {
            errors.subject = 'Subject is required';
            isValid = false;
        } else if (formFields.subject.value.trim().length < 5) {
            errors.subject = 'Subject must be at least 5 characters';
            isValid = false;
        }

        // Message validation
        if (!formFields.message.value.trim()) {
            errors.message = 'Message is required';
            isValid = false;
        } else if (formFields.message.value.trim().length < 10) {
            errors.message = 'Message must be at least 10 characters';
            isValid = false;
        }

        // Display errors or submit
        if (!isValid) {
            displayErrors(errors);
            return;
        }

        // Simulate form submission
        submitForm();
    });

    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });

        // Remove error styling from inputs
        Object.values(formFields).forEach(field => {
            if (field) {
                field.style.borderColor = '';
            }
        });
    }

    function displayErrors(errors) {
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${field}-error`);
            const fieldElement = formFields[field];
            
            if (errorElement && fieldElement) {
                errorElement.textContent = errors[field];
                errorElement.classList.add('show');
                fieldElement.style.borderColor = 'var(--color-error)';
            }
        });
    }

    function submitForm() {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            // Show success message
            showNotification('Message sent successfully! Thank you for reaching out.', 'success');
            
            // Reset form
            contactForm.reset();
        }, 2000);
    }
}

// Project modal functionality
function initProjectModals() {
    const projectCards = document.querySelectorAll('.project-card');
    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    if (!modal || !modalClose || !modalTitle || !modalContent) {
        console.warn('Modal elements not found');
        return;
    }

    // Project data
    const projectsData = {
        1: {
            title: "Gemini AI Training Backend System",
            category: "AI/ML Engineering",
            description: "Contributed to the backend infrastructure for Google's Gemini AI model training pipeline at Turing. Developed scalable data processing systems and optimized training workflows.",
            technologies: ["Python", "TensorFlow", "Google Cloud Platform", "Kubernetes", "Apache Beam"],
            highlights: [
                "Optimized data preprocessing pipeline reducing training time by 40%",
                "Implemented distributed training architecture for large language models",
                "Collaborated with Google engineers on model optimization strategies"
            ],
            details: "This project involved building robust backend systems capable of handling massive datasets for AI model training. The architecture needed to be scalable, fault-tolerant, and optimized for performance across distributed computing environments.",
            github: "https://github.com/devamittran-m/gemini-training-backend",
            demo: "https://demo.example.com/gemini-project"
        },
        2: {
            title: "Customer Churn Prediction Model",
            category: "Machine Learning",
            description: "Built an end-to-end machine learning pipeline to predict customer churn for a telecommunications company, achieving 92% accuracy with ensemble methods.",
            technologies: ["Python", "Scikit-learn", "Pandas", "Flask", "Docker"],
            highlights: [
                "Achieved 92% accuracy using Random Forest and XGBoost ensemble",
                "Deployed model using Flask API with real-time predictions",
                "Reduced customer churn by 25% through targeted retention campaigns"
            ],
            details: "Developed a comprehensive solution that analyzes customer behavior patterns, usage metrics, and demographic data to predict likelihood of churn. The model helps businesses proactively identify at-risk customers and implement retention strategies.",
            github: "https://github.com/devamittran-m/customer-churn-prediction",
            demo: "https://churn-predictor.herokuapp.com"
        },
        3: {
            title: "Real-time Sentiment Analysis Dashboard",
            category: "NLP & Analytics",
            description: "Developed a real-time sentiment analysis system for social media monitoring using NLP techniques and streaming data processing.",
            technologies: ["Python", "Apache Kafka", "NLTK", "Streamlit", "AWS"],
            highlights: [
                "Processed 10k+ tweets per minute with real-time sentiment scoring",
                "Built interactive dashboard for trend visualization",
                "Implemented multi-language sentiment analysis support"
            ],
            details: "Created a scalable system for monitoring social media sentiment in real-time. The solution processes streaming data from multiple sources, applies NLP models for sentiment classification, and provides interactive visualizations for trend analysis.",
            github: "https://github.com/devamittran-m/sentiment-analysis-dashboard",
            demo: "https://sentiment-dashboard.streamlit.app"
        },
        4: {
            title: "Time Series Forecasting for Sales Prediction",
            category: "Time Series Analysis",
            description: "Created a comprehensive forecasting system for retail sales prediction using advanced time series models and external factors.",
            technologies: ["Python", "Prophet", "ARIMA", "Plotly", "PostgreSQL"],
            highlights: [
                "Improved forecasting accuracy by 35% using Facebook Prophet",
                "Incorporated seasonal patterns and holiday effects",
                "Generated automated reports for business stakeholders"
            ],
            details: "Built an advanced forecasting system that combines multiple time series models to predict sales trends. The system accounts for seasonality, holidays, promotional events, and external economic factors to provide accurate business forecasts.",
            github: "https://github.com/devamittran-m/sales-forecasting",
            demo: "https://sales-forecast-demo.herokuapp.com"
        }
    };

    // Add click listeners to project cards
    projectCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const projectId = this.getAttribute('data-project');
            const project = projectsData[projectId];
            
            if (project) {
                showProjectModal(project);
            }
        });
    });

    // Close modal functionality
    modalClose.addEventListener('click', function(e) {
        e.preventDefault();
        closeModal();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    function showProjectModal(project) {
        modalTitle.textContent = project.title;
        
        modalContent.innerHTML = `
            <div class="project-modal-content">
                <div class="project-category-modal">
                    <span class="project-category">${project.category}</span>
                </div>
                
                <p class="project-description-modal">${project.description}</p>
                
                <div class="project-details">
                    <h4>Project Details</h4>
                    <p>${project.details}</p>
                </div>
                
                <div class="project-technologies-modal">
                    <h4>Technologies Used</h4>
                    <div class="tech-tags-modal">
                        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
                
                <div class="project-highlights-modal">
                    <h4>Key Highlights</h4>
                    <ul>
                        ${project.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="project-links-modal">
                    <a href="${project.github}" target="_blank" class="btn btn--outline">
                        <i class="fab fa-github"></i> View on GitHub
                    </a>
                    <a href="${project.demo}" target="_blank" class="btn btn--primary">
                        <i class="fas fa-external-link-alt"></i> Live Demo
                    </a>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Resume download functionality
function initResumeDownload() {
    const downloadBtn = document.getElementById('download-resume');
    
    if (!downloadBtn) return;
    
    downloadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Show loading state
        this.classList.add('loading');
        this.disabled = true;
        
        // Simulate download preparation
        setTimeout(() => {
            this.classList.remove('loading');
            this.disabled = false;
            
            // Show notification since actual download isn't available
            showNotification('Resume download would start here. This is a demo portfolio.', 'info');
            
            // In a real application, you would trigger an actual download:
            // const link = document.createElement('a');
            // link.href = '/path/to/resume.pdf';
            // link.download = 'Devamittran_M_Resume.pdf';
            // link.click();
        }, 1500);
    });
}

// Scroll effects and animations
function initScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Add animation classes to elements
    const animatedElements = document.querySelectorAll('.skill-category, .project-card, .experience-item, .about-highlights .highlight-item');
    
    animatedElements.forEach((el, index) => {
        // Set initial state
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        // Observe element
        observer.observe(el);
    });

    // Smooth scroll for hero buttons
    const heroButtons = document.querySelectorAll('.hero-buttons a');
    heroButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Utility function for notifications
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--space-16);
        box-shadow: var(--shadow-lg);
        z-index: 3000;
        max-width: 400px;
        opacity: 0;
        transform: translateX(100%);
        transition: all var(--duration-normal) var(--ease-standard);
    `;
    
    // Type-specific styling
    if (type === 'success') {
        notification.style.borderColor = 'var(--color-success)';
        notification.style.background = `rgba(var(--color-success-rgb), 0.1)`;
    } else if (type === 'error') {
        notification.style.borderColor = 'var(--color-error)';
        notification.style.background = `rgba(var(--color-error-rgb), 0.1)`;
    } else if (type === 'info') {
        notification.style.borderColor = 'var(--color-info)';
        notification.style.background = `rgba(var(--color-info-rgb), 0.1)`;
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => removeNotification(notification));
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => removeNotification(notification), 5000);
    
    function removeNotification(notificationEl) {
        if (notificationEl && notificationEl.parentNode) {
            notificationEl.style.opacity = '0';
            notificationEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notificationEl.parentNode) {
                    notificationEl.parentNode.removeChild(notificationEl);
                }
            }, 300);
        }
    }
}

// Inject additional modal styles
const modalStyles = `
    .project-modal-content {
        color: var(--color-text);
    }
    
    .project-category-modal {
        margin-bottom: var(--space-16);
    }
    
    .project-description-modal {
        font-size: var(--font-size-lg);
        line-height: 1.6;
        margin-bottom: var(--space-24);
        color: var(--color-text-secondary);
    }
    
    .project-details {
        margin-bottom: var(--space-24);
    }
    
    .project-details h4 {
        color: var(--color-text);
        margin-bottom: var(--space-12);
    }
    
    .project-details p {
        color: var(--color-text-secondary);
        line-height: 1.6;
    }
    
    .project-technologies-modal {
        margin-bottom: var(--space-24);
    }
    
    .project-technologies-modal h4 {
        color: var(--color-text);
        margin-bottom: var(--space-12);
    }
    
    .tech-tags-modal {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-8);
    }
    
    .project-highlights-modal {
        margin-bottom: var(--space-24);
    }
    
    .project-highlights-modal h4 {
        color: var(--color-text);
        margin-bottom: var(--space-12);
    }
    
    .project-highlights-modal ul {
        color: var(--color-text-secondary);
        padding-left: var(--space-20);
    }
    
    .project-highlights-modal li {
        margin-bottom: var(--space-8);
        line-height: 1.6;
    }
    
    .project-links-modal {
        display: flex;
        gap: var(--space-16);
        flex-wrap: wrap;
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--space-12);
    }
    
    .notification-message {
        color: var(--color-text);
        flex: 1;
        line-height: 1.4;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--color-text-secondary);
        cursor: pointer;
        font-size: var(--font-size-lg);
        padding: 0;
        line-height: 1;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        color: var(--color-text);
    }
`;

// Inject modal styles
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);