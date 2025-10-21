// 树形结构专用JavaScript
console.log('树形结构脚本开始加载...');

let familyData = [];
let isLoading = false;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('树形结构DOM加载完成');
    loadFamilyData();
    initializeTreeNavigation();
});

// 加载家族数据
async function loadFamilyData() {
    try {
        console.log('开始加载家族数据...');
        const response = await fetch('all-members.json');
        familyData = await response.json();
        console.log('家族数据加载完成，成员数量:', familyData.length);
    } catch (error) {
        console.error('加载家族数据失败:', error);
    }
}

// 初始化树形结构导航
function initializeTreeNavigation() {
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
    if (isLoading || !familyData.length) return;
    isLoading = true;
    
    const container = document.getElementById('genealogyTree');
    if (!container) {
        isLoading = false;
        return;
    }
    
    console.log('开始加载总谱树...');
    container.innerHTML = '<p>正在构建家族树...</p>';
    
    try {
        // 构建完整的家族树
        const rootPerson = familyData[0];
        const treeHtml = buildSimpleFamilyTree(rootPerson, true);
        container.innerHTML = treeHtml;
        
        console.log('总谱树构建完成');
    } catch (error) {
        console.error('构建总谱树失败:', error);
        container.innerHTML = '<p>构建家族树时出错，请刷新页面重试</p>';
    }
    
    isLoading = false;
}

// 加载本支树形结构
function loadMainlineTree() {
    if (isLoading || !familyData.length) return;
    isLoading = true;
    
    const container = document.getElementById('mainlineTree');
    if (!container) {
        isLoading = false;
        return;
    }
    
    console.log('开始加载本支树...');
    container.innerHTML = '<p>正在构建本支树...</p>';
    
    try {
        // 只显示第一个成员及其后代
        const rootPerson = familyData[0];
        const treeHtml = buildSimpleFamilyTree(rootPerson, false);
        container.innerHTML = treeHtml;
        
        console.log('本支树构建完成');
    } catch (error) {
        console.error('构建本支树失败:', error);
        container.innerHTML = '<p>构建本支树时出错，请刷新页面重试</p>';
    }
    
    isLoading = false;
}

// 构建简化的家族树HTML
function buildSimpleFamilyTree(person, includeAll = true) {
    if (!person) return '';
    
    let html = '';
    
    // 显示当前成员
    if (includeAll || person === familyData[0]) {
        html += '<div class="generation">';
        
        // 如果有配偶，显示夫妻节点
        if (person.spouse) {
            html += '<div class="couple-container">';
            html += createSimplePersonNode(person.spouse);
            html += createSimplePersonNode(person);
            html += '</div>';
        } else {
            html += createSimplePersonNode(person);
        }
        
        html += '</div>';
    }
    
    // 显示子女
    if (person.children && person.children.length > 0) {
        html += '<div class="generation">';
        person.children.forEach(child => {
            if (includeAll || isDescendantOfRoot(child, familyData[0])) {
                html += buildSimpleFamilyTree(child, includeAll);
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

// 创建简化的人物节点HTML
function createSimplePersonNode(person) {
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

// 显示人物详情
function showPersonDetail(personId) {
    const person = findPersonById(personId);
    if (!person) {
        console.log('未找到人物:', personId);
        return;
    }
    
    const modal = document.getElementById('personModal');
    const details = document.getElementById('personDetails');
    
    if (modal && details) {
        details.innerHTML = createPersonDetailHTML(person);
        modal.style.display = 'block';
        console.log('显示人物详情:', person.name);
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
    }
});

console.log('树形结构脚本加载完成');
