document.addEventListener('DOMContentLoaded', async function () {
    // Загрузка списка групп при загрузке страницы
    const groupSelect = document.getElementById('group-select');
    const groupResponse = await fetch('/groups/public');

    if (groupResponse.ok) {
        const groups = await groupResponse.json();
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            groupSelect.appendChild(option);
        });
    } else {
        alert('Failed to load groups');
    }

    // Загрузка данных о студентах при выборе группы
    document.getElementById('load-data').addEventListener('click', async function () {
        const groupId = groupSelect.value;
        const response = await fetch(`/students/public/${groupId}`);

        if (response.ok) {
            const students = await response.json();
            const tbody = document.getElementById('students-list');
            tbody.innerHTML = ''; // Очистка таблицы перед загрузкой новых данных

            students.forEach(student => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${student.first_name}</td>
                    <td>${student.middle_name}</td>
                    <td>${student.last_name}</td>
                    <td>${student.penguin_count}</td>`;
                tbody.appendChild(tr);
            });

            document.getElementById('student-data').style.display = 'block';
        } else {
            alert('Failed to load students');
        }
    });
});
