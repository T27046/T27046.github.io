// 滚动动画处理
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
            }
        });
    }, observerOptions);

    // 观察所有需要滚动动画的元素
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
}

// 鼠标跟随效果
function initMouseFollowEffect() {
    const cursor = document.createElement('div');
    cursor.className = 'mouse-cursor';
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
}

// 按钮悬停效果
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .download-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
            this.style.boxShadow = '0 8px 25px rgba(0, 120, 212, 0.3)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 15px rgba(0, 120, 212, 0.2)';
        });
    });
}

// 卡片悬停效果
function initCardEffects() {
    const cards = document.querySelectorAll('.feature-card, .download-card, .contact-item');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        });
    });
}

// 表单交互效果
function initFormEffects() {
    const inputs = document.querySelectorAll('.form-input, .form-textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#0078d4';
            this.style.boxShadow = '0 0 0 3px rgba(0, 120, 212, 0.1)';
        });
        
        input.addEventListener('blur', function() {
            this.style.borderColor = '#ddd';
            this.style.boxShadow = 'none';
        });
    });
}

// 平滑滚动导航
function initSmoothScroll() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                // 计算目标位置，考虑导航栏高度
                const navHeight = document.querySelector('.glass-nav').offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 20;
                
                // 使用更简单的平滑滚动方法，兼容性更好
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 滚动时高亮当前导航链接
function initActiveNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function updateActiveNav() {
        let currentSection = '';
        const scrollPosition = window.scrollY + 100; // 偏移量，提前激活
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
            }
        });
    }
    
    // 监听滚动事件
    window.addEventListener('scroll', updateActiveNav);
    
    // 页面加载时也更新一次
    updateActiveNav();
}

// 页面加载动画
function initPageLoadAnimations() {
    // 添加加载完成后的动画类
    document.addEventListener('DOMContentLoaded', function() {
        document.body.classList.add('page-loaded');
        
        // 初始化所有效果
        initScrollAnimations();
        initMouseFollowEffect();
        initButtonEffects();
        initCardEffects();
        initFormEffects();
        initSmoothScroll();
        initActiveNavHighlight();
    });
}

// 响应式导航菜单
function initResponsiveNav() {
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '☰';
    
    const nav = document.querySelector('.glass-nav');
    const navLinks = document.querySelector('.nav-links');
    
    if (nav && navLinks) {
        nav.appendChild(menuToggle);
        
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('nav-active');
            menuToggle.classList.toggle('menu-active');
        });
    }
}

// 导出初始化函数
window.initWebsite = function() {
    initPageLoadAnimations();
    initResponsiveNav();
};

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initWebsite);
} else {
    window.initWebsite();
}