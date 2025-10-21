// 全局变量
let currentPhotoIndex = 0;
let photoList = [
    'images/picture/滚动相册/0001.jpg',
    'images/picture/滚动相册/0002.jpg',
    'images/picture/滚动相册/0003.jpg',
    'images/picture/滚动相册/0004.jpg',
    'images/picture/滚动相册/0005.jpg',
    'images/picture/滚动相册/0006.jpg',
    'images/picture/滚动相册/0007.jpg',
    'images/picture/滚动相册/0008.jpg',
    'images/picture/滚动相册/0009.jpg',
    'images/picture/滚动相册/0010.jpg'
];

let familyData = [];
let musicPlaying = true;
let isLoading = false;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('开始初始化页面...');
    loadFamilyData();
    initializePhotoCarousel();
    initializeMusic();
    initializeNavigation();
    console.log('页面初始化完成');
});

// 加载家族数据
async function loadFamilyData() {
    try {
        const response = await fetch('all-members.json');
        familyData = await response.json();
        console.log('家族数据加载完成:', familyData);
    } catch (error) {
        console.error('加载家族数据失败:', error);
    }
}

// 初始化相册轮播
function initializePhotoCarousel() {
    updatePhotoDisplay();
    
    // 自动播放相册
    setInterval(() => {
        if (document.getElementById('gallery').classList.contains('active')) {
            nextPhoto();
        }
    }, 3000);
}

// 更新照片显示
function updatePhotoDisplay() {
    const image = document.getElementById('carouselImage');
    const counter = document.getElementById('photoCounter');
    
    if (image && counter) {
        image.src = photoList[currentPhotoIndex];
        counter.textContent = `${currentPhotoIndex + 1} / ${photoList.length}`;
    }
}

// 上一张照片
function previousPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + photoList.length) % photoList.length;
    updatePhotoDisplay();
}

// 下一张照片
function nextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % photoList.length;
    updatePhotoDisplay();
}

// 初始化音乐
function initializeMusic() {
    const audio = document.getElementById('bgMusic');
    if (audio) {
        audio.volume = 0.3; // 设置音量为30%
    }
}

// 初始化导航
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            if (pageId) {
                showPage(pageId);
            }
        });
    });
    
    // 初始化音乐控制按钮
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }
    
    // 使用事件委托处理人物节点点击
    document.addEventListener('click', function(e) {
        const personNode = e.target.closest('.person-node');
        if (personNode) {
            const personId = parseInt(personNode.getAttribute('data-person-id'));
            if (personId) {
                showPersonDetail(personId);
            }
        }
    });
}

// 切换音乐播放/暂停
function toggleMusic() {
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

// 显示指定页面
function showPage(pageId) {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // 显示指定页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // 更新导航栏活动状态
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            }
        });
        
        // 根据页面类型加载相应内容
        if (pageId === 'genealogy') {
            loadGenealogyTree();
        } else if (pageId === 'mainline') {
            loadMainlineTree();
        }
    }
}

// 加载总谱树形结构
function loadGenealogyTree() {
    if (isLoading) return;
    isLoading = true;
    
    const container = document.getElementById('genealogyTree');
    if (!container || !familyData.length) {
        isLoading = false;
        return;
    }
    
    console.log('开始加载总谱树...');
    
    // 清除现有内容
    container.innerHTML = '';
    
    // 构建完整的家族树
    const rootPerson = familyData[0];
    const treeHtml = buildFamilyTree(rootPerson, true);
    container.innerHTML = treeHtml;
    
    // 添加SVG连接线
    setTimeout(() => {
        addTreeConnections(container, rootPerson, true);
        isLoading = false;
        console.log('总谱树加载完成');
    }, 200);
}

// 加载本支树形结构
function loadMainlineTree() {
    if (isLoading) return;
    isLoading = true;
    
    const container = document.getElementById('mainlineTree');
    if (!container || !familyData.length) {
        isLoading = false;
        return;
    }
    
    console.log('开始加载本支树...');
    
    // 清除现有内容
    container.innerHTML = '';
    
    // 只显示第一个成员及其后代
    const rootPerson = familyData[0];
    const treeHtml = buildFamilyTree(rootPerson, false);
    container.innerHTML = treeHtml;
    
    // 添加SVG连接线
    setTimeout(() => {
        addTreeConnections(container, rootPerson, false);
        isLoading = false;
        console.log('本支树加载完成');
    }, 200);
}

// 构建家族树HTML
function buildFamilyTree(person, includeAll = true) {
    if (!person) return '';
    
    let html = '';
    
    // 如果包含所有成员或者是根成员，显示当前成员
    if (includeAll || person === familyData[0]) {
        html += '<div class="generation">';
        
        // 如果有配偶，显示夫妻节点
        if (person.spouse) {
            html += '<div class="couple-container">';
            html += createPersonNode(person.spouse);
            html += createPersonNode(person);
            html += '</div>';
        } else {
            html += createPersonNode(person);
        }
        
        html += '</div>';
    }
    
    // 显示子女
    if (person.children && person.children.length > 0) {
        html += '<div class="generation">';
        person.children.forEach(child => {
            if (includeAll || isDescendantOfRoot(child, familyData[0])) {
                html += buildFamilyTree(child, includeAll);
            }
        });
        html += '</div>';
    }
    
    return html;
}

// 检查是否为根成员的后代
function isDescendantOfRoot(person, root) {
    if (!root || !root.children) return false;
    
    for (let child of root.children) {
        if (child.id === person.id) return true;
        if (isDescendantOfRoot(person, child)) return true;
    }
    
    return false;
}

// 创建人物节点HTML
function createPersonNode(person) {
    if (!person) return '';
    
    const photo = person.photo || 'images/gallery/default.png';
    const name = person.name || '未知';
    
    return `
        <div class="person-node" data-person-id="${person.id}">
            <img src="${photo}" alt="${name}" class="person-avatar" onerror="this.src='images/gallery/default.png'">
            <div class="person-name">${name}</div>
        </div>
    `;
}

// 添加树形连接线
function addTreeConnections(container, rootPerson, includeAll = true) {
    // 移除现有的连接线
    const existingSvg = container.querySelector('.tree-connections');
    if (existingSvg) {
        existingSvg.remove();
    }
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'tree-connections');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '1';
    
    container.appendChild(svg);
    
    // 递归添加连接线
    addConnectionsForPerson(svg, rootPerson, includeAll);
}

// 为特定人员添加连接线
function addConnectionsForPerson(svg, person, includeAll = true) {
    if (!person || !person.children) return;
    
    const personNode = document.querySelector(`[data-person-id="${person.id}"]`);
    if (!personNode) return;
    
    const personRect = personNode.getBoundingClientRect();
    const containerRect = svg.parentElement.getBoundingClientRect();
    
    const personX = personRect.left - containerRect.left + personRect.width / 2;
    const personY = personRect.top - containerRect.top + personRect.height;
    
    // 获取所有显示的子女节点
    const childNodes = person.children.filter(child => 
        includeAll || isDescendantOfRoot(child, familyData[0])
    ).map(child => document.querySelector(`[data-person-id="${child.id}"]`)).filter(node => node);
    
    if (childNodes.length > 0) {
        const firstChildRect = childNodes[0].getBoundingClientRect();
        const lastChildRect = childNodes[childNodes.length - 1].getBoundingClientRect();
        
        const firstChildX = firstChildRect.left - containerRect.left + firstChildRect.width / 2;
        const lastChildX = lastChildRect.left - containerRect.left + lastChildRect.width / 2;
        const childrenY = firstChildRect.top - containerRect.top;
        
        // 创建连接线路径
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        if (childNodes.length === 1) {
            // 单个子女，直接连接
            path.setAttribute('d', `M ${personX} ${personY} L ${firstChildX} ${childrenY}`);
        } else {
            // 多个子女，使用横线+圆弧连接
            const midY = personY + (childrenY - personY) / 2;
            path.setAttribute('d', `
                M ${personX} ${personY} 
                L ${personX} ${midY}
                M ${firstChildX} ${midY} 
                L ${lastChildX} ${midY}
                M ${firstChildX} ${midY} 
                Q ${firstChildX} ${childrenY} ${firstChildX} ${childrenY}
                M ${lastChildX} ${midY} 
                Q ${lastChildX} ${childrenY} ${lastChildX} ${childrenY}
            `);
        }
        
        path.setAttribute('class', 'connection-line');
        svg.appendChild(path);
    }
    
    // 递归处理子女
    person.children.forEach(child => {
        if (includeAll || isDescendantOfRoot(child, familyData[0])) {
            addConnectionsForPerson(svg, child, includeAll);
        }
    });
}

// 显示人物详情
function showPersonDetail(personId) {
    const person = findPersonById(personId);
    if (!person) return;
    
    const modal = document.getElementById('personModal');
    const details = document.getElementById('personDetails');
    
    if (modal && details) {
        details.innerHTML = createPersonDetailHTML(person);
        modal.style.display = 'block';
    }
}

// 根据ID查找人员
function findPersonById(id) {
    function searchInPerson(person) {
        if (person.id === id) return person;
        
        if (person.children) {
            for (let child of person.children) {
                const found = searchInPerson(child);
                if (found) return found;
            }
        }
        
        if (person.spouse) {
            const found = searchInPerson(person.spouse);
            if (found) return found;
        }
        
        return null;
    }
    
    for (let person of familyData) {
        const found = searchInPerson(person);
        if (found) return found;
    }
    
    return null;
}

// 创建人物详情HTML
function createPersonDetailHTML(person) {
    if (!person) return '';
    
    return `
        <div class="person-detail">
            <h3>${person.name || '未知'} / ${person.nameKorea || ''}</h3>
            
            <div class="detail-row">
                <div class="detail-label">姓名</div>
                <div class="detail-value">
                    <div class="bilingual-text">
                        <div class="chinese-text">${person.name || '未知'}</div>
                        <div class="korean-text">${person.nameKorea || ''}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">排行</div>
                <div class="detail-value">第${person.order || '?'}个</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">性别</div>
                <div class="detail-value">${person.sex || '未知'}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">出生日期</div>
                <div class="detail-value">${person.birth || '未知'}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">离世日期</div>
                <div class="detail-value">${person.death || '健在'}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">职业</div>
                <div class="detail-value">${person.job || '未知'}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">居住地</div>
                <div class="detail-value">${person.residence || '未知'}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">人物纪要</div>
                <div class="detail-value">
                    <div class="bilingual-text">
                        <div class="chinese-text">${person.introduce || '暂无介绍'}</div>
                        <div class="korean-text">${person.introduceKorea || ''}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('personModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('personModal');
    if (event.target === modal) {
        closeModal();
    }
}

// 键盘事件处理
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    } else if (event.key === 'ArrowLeft' && document.getElementById('gallery').classList.contains('active')) {
        previousPhoto();
    } else if (event.key === 'ArrowRight' && document.getElementById('gallery').classList.contains('active')) {
        nextPhoto();
    }
});

// 触摸事件处理（移动端）
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // 左滑，下一张
            nextPhoto();
        } else {
            // 右滑，上一张
            previousPhoto();
        }
    }
}
