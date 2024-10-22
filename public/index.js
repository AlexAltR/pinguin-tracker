document.addEventListener('DOMContentLoaded', async function () {
    // Функция, которая выполняется сразу после загрузки страницы (DOMContentLoaded)
    // Основная цель — загрузить список групп, которые будут доступны для выбора пользователем

    const groupSelect = document.getElementById('group-select');
    // Получаем ссылку на элемент select, в который будут загружены группы

    const groupResponse = await fetch('/groups/public');
    // Отправляем запрос на получение списка групп с публичным доступом

    if (groupResponse.ok) {
        const groups = await groupResponse.json();
        // Если запрос успешен, получаем данные о группах и обрабатываем их

        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            groupSelect.appendChild(option);
            // Для каждой группы создаём элемент <option> и добавляем его в <select>
        });
    } else {
        alert('Failed to load groups');
        // Если произошла ошибка при загрузке групп, выводим сообщение об ошибке
    }

    // Добавляем обработчик события на кнопку для загрузки данных о студентах
    document.getElementById('load-data').addEventListener('click', async function () {
        const groupId = groupSelect.value;
        // Получаем ID выбранной группы

        const response = await fetch(`/students/public/${groupId}`);
        // Отправляем запрос на получение списка студентов, связанных с выбранной группой

        if (response.ok) {
            const students = await response.json();
            // Если запрос успешен, получаем данные о студентах

            const tbody = document.getElementById('students-list');
            tbody.innerHTML = ''; // Очищаем таблицу перед загрузкой новых данных

            students.forEach(student => {
                // Для каждого студента создаем строку таблицы и заполняем её данными
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${student.first_name}</td>
                    <td>${student.middle_name}</td>
                    <td>${student.last_name}</td>
                    <td>${student.penguin_count}</td>`;
                tbody.appendChild(tr);
            });

            document.getElementById('student-data').style.display = 'block';
            // Отображаем таблицу с данными о студентах
        } else {
            alert('Failed to load students');
            // Если произошла ошибка при загрузке данных о студентах, выводим сообщение об ошибке
        }
    });
});
