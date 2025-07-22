const accountData = {
    google1: {
        service: "pornhub.com",
        email: "John.Doe@gmail.com",
        username: "JohnDoe",
        password: "MySecretPass123",
        totp: "123456",
        lastUsed: "Last used: 15:23 on the 3 of December 2024",
        created: "Created: 5 of July 2024"
    },
    google2: {
        service: "onlyfans.com",
        email: "John.Doe@gmail.com",
        username: "JohnDoe",
        password: "IamN0tJon",
        totp: "461938",
        lastUsed: "Last used: 17:54 on the 5 of December 2024",
        created: "Created: 7 of July 2024"
    },
    google3: {
        service: "feetfinder.com",
        email: "John.Doe@gmail.com",
        username: "JohnDoe_Alt",
        password: "AlternatePass456",
        totp: "789012",
        lastUsed: "Last used: 09:12 on the 1 of December 2024",
        created: "Created: 15 of June 2024"
    },
    amazon1: {
        service: "Amazon",
        email: "John.Doe@gmail.com",
        username: "JohnDoe",
        password: "AmazonShopping!",
        totp: "345678",
        lastUsed: "Last used: 14:30 on the 4 of December 2024",
        created: "Created: 12 of August 2024"
    },
    facebook1: {
        service: "Facebook",
        email: "John.Doe@gmail.com",
        username: "JohnDoe",
        password: "SocialMedia2024",
        totp: "901234",
        lastUsed: "Last used: 20:45 on the 2 of December 2024",
        created: "Created: 20 of May 2024"
    },
    twitter1: {
        service: "Twitter",
        email: "John.Doe@gmail.com",
        username: "JohnDoe",
        password: "TwitterPass789",
        totp: "567890",
        lastUsed: "Last used: 11:20 on the 6 of December 2024",
        created: "Created: 3 of September 2024"
    },
    microsoft1: {
        service: "Microsoft",
        email: "John.Doe@gmail.com",
        username: "JohnDoe",
        password: "OfficeUser2024",
        totp: "234567",
        lastUsed: "Last used: 08:15 on the 7 of December 2024",
        created: "Created: 10 of April 2024"
    }
};

function updateDetailPanel(accountKey) {
    const account = accountData[accountKey];
    if (!account) return;

    document.getElementById('serviceName').textContent = account.service;
    document.getElementById('emailValue').textContent = account.email;
    document.getElementById('usernameValue').textContent = account.username;
    document.getElementById('passwordInput').value = account.password;
    document.getElementById('totpValue').textContent = account.totp;
    document.getElementById('lastUsed').textContent = account.lastUsed;
    document.getElementById('created').textContent = account.created;
    
    // Reset password field to hidden when switching accounts
    const passwordInput = document.getElementById('passwordInput');
    const eye = document.querySelector('.toggle-eye');
    passwordInput.type = 'password';
    eye.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>`;
}

function filterSidebarItems(searchTerm) {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const lowercaseSearch = searchTerm.toLowerCase();

    sidebarItems.forEach(item => {
        const service = item.querySelector('.service').textContent.toLowerCase();
        const email = item.querySelector('.email').textContent.toLowerCase();
        
        if (service.includes(lowercaseSearch) || email.includes(lowercaseSearch)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function togglePassword() {
    const passwordInput = document.getElementById('passwordInput');
    const eye = document.querySelector('.toggle-eye');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        // Eye with slash (hidden)
        eye.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68"></path>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 8 11 8a9.74 9.74 0 0 0 5.39-1.61"></path>
            <line x1="2" y1="2" x2="22" y2="22"></line>
        </svg>`;
    } else {
        passwordInput.type = 'password';
        // Normal eye (visible)
        eye.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function(e) {
        filterSidebarItems(e.target.value);
    });

    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            const accountKey = this.getAttribute('data-account');
            updateDetailPanel(accountKey);
        });
    });

    const menuIcon = document.querySelector('.menu-icon');
    menuIcon.addEventListener('click', function() {
        console.log('Menu clicked');
    });

    // Initialize with the default active account
    const activeItem = document.querySelector('.sidebar-item.active');
    if (activeItem) {
        const accountKey = activeItem.getAttribute('data-account');
        updateDetailPanel(accountKey);
    }
});