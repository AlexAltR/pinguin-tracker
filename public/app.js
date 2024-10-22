document.getElementById('login-button').addEventListener('click', async function () {
    // При клике на кнопку логина происходит попытка аутентификации пользователя
    const email = document.getElementById('email').value;  // Получаем значение email из input
    const password = document.getElementById('password').value;  // Получаем значение пароля из input

    // Выполняем POST-запрос на сервер для аутентификации
    const response = await fetch('/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Указываем тип контента, который мы отправляем
        },
        body: JSON.stringify({ email, password }),  // Преобразуем данные в JSON-строку и отправляем
    });

    if (response.ok) {
        // Если аутентификация успешна, сервер вернет токен
        const { token } = await response.json();
        localStorage.setItem('token', token);  // Сохраняем токен в localStorage для дальнейшего использования
        document.getElementById('login-section').style.display = 'none';  // Скрываем секцию логина
        document.getElementById('group-management').style.display = 'block';  // Показываем секцию управления группами

        // Загрузка списка групп для управления
        const groupSelect = document.getElementById('group-select');
        const groupResponse = await fetch('/groups', {
            headers: {
                'Authorization': `Bearer ${token}`  // Отправляем запрос с токеном в заголовке для авторизации
            }
        });

        if (groupResponse.ok) {
            // Если запрос успешен, загружаем группы в select
            const groups = await groupResponse.json();
            groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group.id;
                option.textContent = group.name;
                groupSelect.appendChild(option);  // Добавляем опции для выбора группы
            });
        } else {
            alert('Failed to load groups');  // Если не удалось загрузить группы, выводим ошибку
        }
    } else {
        alert('Login failed');  // Если аутентификация не удалась, показываем сообщение об ошибке
    }
});

document.getElementById('select-group').addEventListener('click', function () {
    // Когда пользователь выбирает группу, скрываем секцию групп и показываем секцию студентов
    document.getElementById('group-management').style.display = 'none';
    document.getElementById('student-management').style.display = 'block';

    // Загружаем список студентов для выбранной группы
    loadStudents();
});

async function loadStudents() {
    // Функция для загрузки студентов, связанных с выбранной группой
    const groupId = document.getElementById('group-select').value;  // Получаем ID выбранной группы

    // Выполняем запрос на сервер для получения списка студентов этой группы
    const response = await fetch(`/students/${groupId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`  // Отправляем запрос с токеном
        }
    });

    if (response.ok) {
        // Если запрос успешен, обновляем таблицу студентов
        const students = await response.json();
        const tbody = document.getElementById('students-list');
        tbody.innerHTML = '';  // Очищаем текущую таблицу

        students.forEach(student => {
            // Создаем строку для каждого студента и добавляем в таблицу
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${student.first_name}</td>
                <td>${student.middle_name}</td>
                <td>${student.last_name}</td>
                <td>${student.penguin_count}</td>
                <td>
                    <button onclick="addPenguin(${student.id})">Add Penguin</button>
                </td>
                <td>
                    <button onclick="showDeleteModal(${student.id})">Delete Student</button>
                </td>`;
            tbody.appendChild(tr);  // Добавляем строку в таблицу
        });
    } else {
        alert('Failed to load students');  // Если загрузка студентов не удалась, выводим ошибку
    }
}

// Обработчик для добавления нового студента
document.getElementById('add-student').addEventListener('click', async function () {
    const firstName = document.getElementById('student-first-name').value;  // Получаем данные для нового студента
    const middleName = document.getElementById('student-middle-name').value;
    const lastName = document.getElementById('student-last-name').value;
    const groupId = document.getElementById('group-select').value;  // Получаем ID текущей группы

    // Отправляем POST-запрос на сервер для добавления студента
    const response = await fetch('/students', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Указываем, что отправляем JSON
            'Authorization': `Bearer ${localStorage.getItem('token')}`  // Добавляем токен в заголовок
        },
        body: JSON.stringify({ first_name: firstName, middle_name: middleName, last_name: lastName, group_id: groupId })
    });

    if (response.ok) {
        alert('Student added');  // Если добавление успешно, выводим сообщение
        loadStudents();  // Перезагружаем список студентов
    } else {
        alert('Failed to add student');  // Если ошибка, выводим сообщение
    }
});

// Функция для добавления пингвина студенту
async function addPenguin(studentId) {
    // Выполняем запрос на добавление пингвина студенту по его ID
    const response = await fetch('/penguins/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`  // Отправляем токен для авторизации
        },
        body: JSON.stringify({ student_id: studentId })
    });

    if (response.ok) {
        // Если запрос успешен, показываем сообщение об успехе и перезагружаем список студентов
        const successModal = document.createElement('div');
        successModal.textContent = 'Penguin added successfully!';
        successModal.style.backgroundColor = 'green';
        successModal.style.color = 'white';
        successModal.style.padding = '10px';
        successModal.style.position = 'fixed';
        successModal.style.top = '50%';
        successModal.style.left = '50%';
        successModal.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(successModal);

        setTimeout(() => {
            document.body.removeChild(successModal);  // Удаляем модальное окно через 3 секунды
        }, 3000);

        loadStudents();  // Перезагружаем список студентов
    } else {
        alert('Failed to add penguin');  // Если запрос не удался, выводим сообщение
    }
}

// Логика для удаления студента с модальным окном
let studentToDelete = null;  // Переменная для хранения ID студента, которого нужно удалить

function showDeleteModal(studentId) {
    // Открываем модальное окно и сохраняем ID студента, которого собираемся удалить
    studentToDelete = studentId;
    const modal = document.getElementById('delete-modal');
    modal.style.display = 'block';  // Показываем модальное окно
}

document.getElementById('close-modal').onclick = function () {
    // Закрытие модального окна по клику на кнопку "Закрыть"
    document.getElementById('delete-modal').style.display = 'none';
};

document.getElementById('cancel-delete').onclick = function () {
    // Закрытие модального окна по клику на кнопку "Отмена"
    document.getElementById('delete-modal').style.display = 'none';
};

document.getElementById('confirm-delete').onclick = async function () {
    // Подтверждение удаления студента
    if (studentToDelete !== null) {
        // Выполняем DELETE-запрос для удаления студента
        const response = await fetch(`/students/${studentToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`  // Отправляем токен для авторизации
            }
        });

        if (response.ok) {
            alert('Student deleted');  // Если удаление прошло успешно, выводим сообщение
            document.getElementById('delete-modal').style.display = 'none';  // Закрываем модальное окно
            loadStudents();  // Перезагружаем список студентов
        } else {
            alert('Failed to delete student');  // Если удаление не удалось, выводим сообщение
        }
    }
};
