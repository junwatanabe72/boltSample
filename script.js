document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements with null checks
    const titleInput = document.getElementById('titleInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const priorityInput = document.getElementById('priorityInput');
    const dateInput = document.getElementById('dateInput');
    const addTaskBtn = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortByDateBtn = document.getElementById('sortByDate');

    // Verify all required elements exist
    if (!titleInput || !descriptionInput || !priorityInput || !dateInput || !addTaskBtn || !taskList) {
        console.error('Required DOM elements not found');
        return;
    }

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.valueAsDate = tomorrow;

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function getTaskUrgencyClass(dueDate) {
        if (!dueDate) return '';
        
        const today = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'overdue';
        if (diffDays === 0) return 'due-today';
        if (diffDays <= 3) return 'due-soon';
        return '';
    }

    function getPriorityClass(priority) {
        return `priority-${priority}`;
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function renderTasks(filter = 'all', sorted = false) {
        if (!taskList) return;

        taskList.innerHTML = '';
        
        let filteredTasks = tasks.filter(task => {
            if (filter === 'active') return !task.completed;
            if (filter === 'completed') return task.completed;
            return true;
        });

        if (sorted) {
            filteredTasks.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
        }

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            const urgencyClass = getTaskUrgencyClass(task.dueDate);
            const priorityClass = getPriorityClass(task.priority);
            li.className = `task-item ${task.completed ? 'completed' : ''} ${urgencyClass} ${priorityClass}`;
            
            li.innerHTML = `
                <div class="task-header">
                    <label class="checkbox-label">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        完了
                    </label>
                    <span class="task-title">${task.title}</span>
                    <span class="priority-badge">${task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}</span>
                </div>
                <div class="task-body">
                    <p class="task-description">${task.description}</p>
                    <span class="due-date">${formatDate(task.dueDate)}</span>
                </div>
                <button class="delete-btn">削除</button>
            `;

            const checkbox = li.querySelector('.task-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', () => toggleTask(index));
            }

            const deleteBtn = li.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => deleteTask(index));
            }

            taskList.appendChild(li);
        });
    }

    function addTask(title, description, priority, dueDate) {
        if (!title || title.trim() === '') return;
        tasks.push({ 
            title,
            description,
            priority,
            completed: false,
            dueDate: dueDate
        });
        saveTasks();
        renderTasks();
        
        // Reset form fields
        if (titleInput) titleInput.value = '';
        if (descriptionInput) descriptionInput.value = '';
        if (priorityInput) priorityInput.value = 'low';
    }

    function toggleTask(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    function deleteTask(index) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }

    // Add event listeners with null checks
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            if (titleInput && descriptionInput && priorityInput && dateInput) {
                addTask(
                    titleInput.value,
                    descriptionInput.value,
                    priorityInput.value,
                    dateInput.value
                );
            }
        });
    }

    filterBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderTasks(btn.dataset.filter);
            });
        }
    });

    if (sortByDateBtn) {
        sortByDateBtn.addEventListener('click', () => {
            renderTasks('all', true);
        });
    }

    renderTasks();
});