// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar') && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Update active navigation link on scroll
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').slice(1) === current) {
            item.classList.add('active');
        }
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Close mobile menu if open
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
        
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Simple contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show message
        const message = document.createElement('div');
        message.className = 'success-message';
        message.textContent = 'Thank you for your message! Please contact me directly at kartikeyakk2007@gmail.com';
        message.style.cssText = `
            background-color: var(--accent-color);
            color: white;
            padding: 1rem;
            border-radius: 5px;
            margin-top: 1rem;
            text-align: center;
        `;
        
        // Remove any existing messages
        const existingMessage = this.querySelector('.success-message, .error-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Add the new message
        this.appendChild(message);
        
        // Reset the form
        this.reset();
        
        // Remove message after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    });
}

// Add scroll-based animation for navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(18, 18, 18, 0.95)';
    } else {
        navbar.style.backgroundColor = 'var(--bg-primary)';
    }
});

// Add animation to project cards on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.project-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

// Fetch additional repository details
async function fetchRepoDetails(repo) {
    try {
        const response = await fetch(repo.url);
        const repoData = await response.json();
        
        // Get repository languages
        const languagesResponse = await fetch(repo.languages_url);
        const languagesData = await languagesResponse.json();
        const mainLanguages = Object.keys(languagesData).slice(0, 2).join(', ');
        
        // Get repository topics
        const topicsResponse = await fetch(repo.topics_url);
        const topicsData = await topicsResponse.json();
        const topics = topicsData.names ? topicsData.names.slice(0, 3).join(', ') : '';
        
        // Generate description based on repository data
        let description = repo.description;
        if (!description) {
            description = `A ${mainLanguages} project${topics ? ` focusing on ${topics}` : ''}. `;
            description += `Created ${new Date(repo.created_at).toLocaleDateString()}. `;
            if (repo.stargazers_count > 0) {
                description += `⭐ ${repo.stargazers_count} stars. `;
            }
            if (repo.forks_count > 0) {
                description += `🔀 ${repo.forks_count} forks. `;
            }
        }
        
        return {
            ...repo,
            enhancedDescription: description,
            languages: mainLanguages,
            topics: topics,
            stars: repo.stargazers_count,
            forks: repo.forks_count
        };
    } catch (error) {
        console.error('Error fetching repository details:', error);
        return repo;
    }
}

// Fetch GitHub Projects
async function fetchGitHubProjects() {
    try {
        const response = await fetch('https://api.github.com/users/kartikeya7609/repos?sort=updated&direction=desc');
        const repos = await response.json();
        
        // Filter and get the 3 most recent non-forked repositories
        const recentProjects = repos
            .filter(repo => !repo.fork)
            .slice(0, 3);
        
        const projectGrid = document.querySelector('.project-grid');
        
        recentProjects.forEach((repo, index) => {
            const projectCard = projectGrid.children[index];
            projectCard.classList.remove('loading');
            
            const projectContent = document.createElement('div');
            projectContent.className = 'project-content';
            
            // Format the description with line breaks and styling
            const formattedDescription = repo.description 
                ? repo.description.split('. ').map(sentence => 
                    `<span class="description-line">${sentence}.</span>`
                ).join('')
                : '<span class="description-line">No description available.</span>';
            
            projectContent.innerHTML = `
                <h3>${repo.name}</h3>
                <div class="description-container">
                    ${formattedDescription}
                </div>
                <div class="project-links">
                    <a href="${repo.html_url}" class="project-link" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-github"></i>
                        View Repository
                    </a>
                </div>
            `;
            
            projectCard.innerHTML = '';
            projectCard.appendChild(projectContent);
        });
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        const projectGrid = document.querySelector('.project-grid');
        projectGrid.innerHTML = `
            <div class="error-message">
                <p>Unable to load projects. Please try again later.</p>
            </div>
        `;
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchGitHubProjects);

// Typing Animation
const typingText = document.querySelector('.typing-text');
const texts = [
    "Web Developer",
    "UI/UX Designer",
    "Problem Solver",
    "Tech Enthusiast"
];
let currentTextIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function type() {
    const currentText = texts[currentTextIndex];
    
    if (isDeleting) {
        typingText.textContent = currentText.substring(0, currentCharIndex - 1);
        currentCharIndex--;
        typingSpeed = 50;
    } else {
        typingText.textContent = currentText.substring(0, currentCharIndex + 1);
        currentCharIndex++;
        typingSpeed = 100;
    }

    if (!isDeleting && currentCharIndex === currentText.length) {
        isDeleting = true;
        typingSpeed = 1500; // Pause at end
    } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentTextIndex = (currentTextIndex + 1) % texts.length;
        typingSpeed = 500; // Pause before typing next
    }

    setTimeout(type, typingSpeed);
}

// Start typing animation
setTimeout(type, 1000);

// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.about, .projects, .contact, .education-item, .clubs-section, .organizations-section');

const revealOnScroll = () => {
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('revealed');
        }
    });
};

// Add reveal animation styles
const style = document.createElement('style');
style.textContent = `
    .about, .projects, .contact, .education-item, .clubs-section, .organizations-section {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .revealed {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Initial check and add scroll event listener
window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); 