const API_BASE = '/api';
let authToken = localStorage.getItem('token');

// DOM Elements
const authSection = document.getElementById('authSection');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const dashboardContent = document.getElementById('dashboardContent');

// Check if user is already logged in
if (authToken) {
    showDashboard();
}

// Login handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.access_token;
            localStorage.setItem('token', authToken);
            localStorage.setItem('username', username);
            showDashboard();
        } else {
            errorMsg.textContent = data.detail || 'Login failed';
        }
    } catch (error) {
        errorMsg.textContent = 'Connection error. Please try again.';
    }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    authToken = null;
    showLogin();
});

function showLogin() {
    authSection.style.display = 'block';
    dashboard.style.display = 'none';
}

function showDashboard() {
    authSection.style.display = 'none';
    dashboard.style.display = 'block';
    userName.textContent = localStorage.getItem('username') || 'User';
    loadDashboardData();
}

async function loadDashboardData() {
    dashboardContent.innerHTML = '<p>Loading...</p>';

    try {
        const profileResponse = await fetch(`${API_BASE}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            
            // Check if user is admin
            if (profileData.role === 'admin') {
                await loadAllUsers();
            } else {
                dashboardContent.innerHTML = `
                    <h3>Profile Information</h3>
                    <p><strong>Username:</strong> ${profileData.username}</p>
                    <p><strong>Role:</strong> ${profileData.role}</p>
                    <p><strong>Status:</strong> ${profileData.is_active ? 'Active' : 'Inactive'}</p>
                `;
            }
        } else {
            dashboardContent.innerHTML = '<p>Failed to load profile data</p>';
        }
    } catch (error) {
        dashboardContent.innerHTML = '<p>Error loading data</p>';
    }
}

async function loadAllUsers() {
    try {
        const response = await fetch(`/user_details/${localStorage.getItem('username')}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            
            let tableHTML = `
                <h3>All Users</h3>
                <table class="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Phone</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            users.forEach(user => {
                tableHTML += `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.phone}</td>
                        <td>${user.name}</td>
                        <td>${user.is_admin ? 'Admin' : 'User'}</td>
                        <td><span class="status ${user.is_active ? 'active' : 'inactive'}">${user.is_active ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                `;
            });

            tableHTML += `
                    </tbody>
                </table>
            `;

            dashboardContent.innerHTML = tableHTML;
        } else {
            dashboardContent.innerHTML = '<p>Failed to load users</p>';
        }
    } catch (error) {
        dashboardContent.innerHTML = '<p>Error loading users</p>';
    }
}
