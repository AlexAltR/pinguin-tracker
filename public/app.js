document.getElementById('login-button').addEventListener('click', async function () {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('token', token);
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('group-management').style.display = 'block';

        // Загрузка групп
        const groupSelect = document.getElementById('group-select');
        const groupResponse = await fetch('/groups', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

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
    } else {
        alert('Login failed');
    }
});

document.getElementById('select-group').addEventListener('click', function () {
    document.getElementById('group-management').style.display = 'none';
    document.getElementById('student-management').style.display = 'block';

    // Подгрузка списка студентов
    loadStudents();
});

async function loadStudents() {
    const groupId = document.getElementById('group-select').value;

    const response = await fetch(`/students/${groupId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (response.ok) {
        const students = await response.json();
        const tbody = document.getElementById('students-list');
        // const studentSelect = document.getElementById('student-select');
        tbody.innerHTML = '';
        // studentSelect.innerHTML = '';

        students.forEach(student => {
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
            tbody.appendChild(tr);

            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.first_name} ${student.middle_name} ${student.last_name}`;
            // studentSelect.appendChild(option);
        });
    } else {
        alert('Failed to load students');
    }
}

// Добавление студента
document.getElementById('add-student').addEventListener('click', async function () {
    const firstName = document.getElementById('student-first-name').value;
    const middleName = document.getElementById('student-middle-name').value;
    const lastName = document.getElementById('student-last-name').value;
    const groupId = document.getElementById('group-select').value;

    const response = await fetch('/students', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ first_name: firstName, middle_name: middleName, last_name: lastName, group_id: groupId })
    });

    if (response.ok) {
        alert('Student added');
        loadStudents();
    } else {
        alert('Failed to add student');
    }
});

// Добавление пингвина студенту
async function addPenguin(studentId) {
    const response = await fetch('/penguins/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ student_id: studentId })
    });

    if (response.ok) {
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
            document.body.removeChild(successModal);
        }, 3000);

        loadStudents();
    } else {
        alert('Failed to add penguin');
    }
}

// Логика для удаления студента с модальным окном
let studentToDelete = null;

function showDeleteModal(studentId) {
    studentToDelete = studentId;
    const modal = document.getElementById('delete-modal');
    modal.style.display = 'block';
}

document.getElementById('close-modal').onclick = function() {
    document.getElementById('delete-modal').style.display = 'none';
};

document.getElementById('cancel-delete').onclick = function() {
    document.getElementById('delete-modal').style.display = 'none';
};

document.getElementById('confirm-delete').onclick = async function() {
    if (studentToDelete !== null) {
        const response = await fetch(`/students/${studentToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            alert('Student deleted');
            document.getElementById('delete-modal').style.display = 'none';
            loadStudents();
        } else {
            alert('Failed to delete student');
        }
    }
};
