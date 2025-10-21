// 简化的JavaScript文件用于测试
console.log('Script.js 开始加载...');

// 全局变量
let currentPhotoIndex = 0;
let familyData = [];
let musicPlaying = true;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始初始化...');
    initializeNavigation();
    console.log('初始化完成');
});

// 初始化导航
function initializeNavigation() {
    console.log('初始化导航...');
    const navLinks = document.querySelectorAll('.nav-menu a');
    console.log('找到导航链接数量:', navLinks.length);
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            console.log('点击导航:', pageId);
            if (pageId) {
                showPage(pageId);
            }
        });
    });
    
    // 初始化音乐控制按钮
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
        console.log('音乐控制按钮已绑定');
    }
}

// 显示指定页面
function showPage(pageId) {
    console.log('切换到页面:', pageId);
    
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // 显示指定页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log('页面切换成功:', pageId);
        
        // 更新导航栏活动状态
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            }
        });
    }
}

// 切换音乐播放/暂停
function toggleMusic() {
    console.log('切换音乐状态');
    const audio = document.getElementById('bgMusic');
    const button = document.getElementById('musicToggle');
    
    if (audio) {
        if (musicPlaying) {
            audio.pause();
            button.textContent = '🔇';
            musicPlaying = false;
        } else {
            audio.play();
            button.textContent = '🎵';
            musicPlaying = true;
        }
    }
}

console.log('Script.js 加载完成');
