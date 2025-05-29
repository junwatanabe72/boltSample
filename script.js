document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('titleInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const priorityInput = document.getElementById('priorityInput');
    const dateInput = document.getElementById('dateInput');
    const addTaskBtn = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortByDateBtn = document.getElementById('sortByDate');

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
        
        let filteredTasks = tasks;
        
        if (filter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

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
            checkbox.addEventListener('change', () => {
                tasks[index].completed = checkbox.checked;
                saveTasks();
                renderTasks(filter, sorted);
            });

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks(filter, sorted);
            });

            taskList.appendChild(li);
        });
    }

    addTaskBtn.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const priority = priorityInput.value;
        const dueDate = dateInput.value;

        if (!title) return;

        tasks.push({
            title,
            description,
            priority,
            dueDate,
            completed: false
        });

        saveTasks();
        renderTasks();

        titleInput.value = '';
        descriptionInput.value = '';
        priorityInput.value = 'low';
        dateInput.valueAsDate = tomorrow;
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks(btn.dataset.filter);
        });
    });

    sortByDateBtn.addEventListener('click', () => {
        renderTasks('all', true);
    });

    renderTasks();
});