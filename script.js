document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
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
            li.className = `task-item ${task.completed ? 'completed' : ''} ${urgencyClass}`;
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <span class="due-date">${formatDate(task.dueDate)}</span>
                <button class="delete-btn">削除</button>
            `;

            const checkbox = li.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => toggleTask(index));

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(index));

            taskList.appendChild(li);
        });
    }

    function addTask(text, dueDate) {
        if (text.trim() === '') return;
        tasks.push({ 
            text, 
            completed: false,
            dueDate: dueDate
        });
        saveTasks();
        renderTasks();
        taskInput.value = '';
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

    addTaskBtn.addEventListener('click', () => {
        addTask(taskInput.value, dateInput.value);
    });
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(taskInput.value, dateInput.value);
        }
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