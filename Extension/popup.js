const accountData = {
    google1: {
        service: "Alibaba",
        email: "John.Doe@gmail.com",
        username: "JohnDoe",
        password: "MySecretPass123",
        totpSecret: "JBSWY3DPEHPK3PXP",
        lastUsed: "Last used: 15:23 on the 3 of December 2024",
        created: "Created: 5 of July 2024"
    },
    google2: {
        service: "AliExpress",
        email: "John.Doe@gmail.com",
        username: "JohnDoe",
        password: "IamN0tJon",
        totpSecret: "JBSWY3DPEHPK3XXP",
        lastUsed: "Last used: 17:54 on the 5 of December 2024",
        created: "Created: 7 of July 2024"
    },
    google3: {
        service: "Temu",
        email: "John.Doe@gmail.com",
        username: "JohnDoe_Alt",
        password: "AlternatePass456",
        totpSecret: "JBSVY3DPEHPK3PXP",
        lastUsed: "Last used: 09:12 on the 1 of December 2024",
        created: "Created: 15 of June 2024"
    },
    amazon1: {
        service: "Amazon",
        email: "John.Doe@gmail.com",
        username: "JohnDoe",
        password: "AmazonShopping!",
        totpSecret: "JBSWY3DPEHPK2PXP",
        lastUsed: "Last used: 14:30 on the 4 of December 2024",
        created: "Created: 12 of August 2024"
    },
    facebook1: {
        service: "Facebook",
        email: "John.Doe@gmail.com",
        username: "JohnDoe",
        password: "SocialMedia2024",
        totpSecret: "JBVWY3DPEHPK3PXP",
        lastUsed: "Last used: 20:45 on the 2 of December 2024",
        created: "Created: 20 of May 2024"
    },
    twitter1: {
        service: "Twitter",
        email: "John.Doe@gmail.com",
        username: "JohnDoe",
        password: "TwitterPass789",
        totpSecret: "BBSWY3DPEHPK3PXP",
        lastUsed: "Last used: 11:20 on the 6 of December 2024",
        created: "Created: 3 of September 2024"
    },
    microsoft1: {
        service: "Microsoft",
        email: "John.Doe@gmail.com",
        username: "JohnDoe",
        password: "OfficeUser2024",
        totpSecret: "JYSWY3DPEHPK3PXP",
        lastUsed: "Last used: 08:15 on the 7 of December 2024",
        created: "Created: 10 of April 2024"
    }
};

function generateTotp(secret, windowSeconds = 30, digits = 6) {
    const key = base32ToBytes(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const time = Math.floor(epoch / windowSeconds);
    const timeBuffer = new ArrayBuffer(8);
    const timeView = new DataView(timeBuffer);
    timeView.setUint32(4, time);

    const cryptoKey = crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
    );

    return cryptoKey.then(key => crypto.subtle.sign('HMAC', key, timeBuffer)).then(signature => {
        const offset = new DataView(signature).getUint8(signature.byteLength - 1) & 0xf;
        const binCode = (
            ((new DataView(signature).getUint32(offset) & 0x7fffffff)) % (10 ** digits)
        ).toString().padStart(digits, '0');
        return binCode;
    });
}

function base32ToBytes(base32) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let bytes = [];

    base32 = base32.replace(/=+$/, '').toUpperCase();

    for (let i = 0; i < base32.length; i++) {
        const val = alphabet.indexOf(base32[i]);
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, '0');
    }

    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }

    return new Uint8Array(bytes);
}


let totpInterval = null;

function updateDetailPanel(accountKey) {
    const account = accountData[accountKey];
    if (!account) return;

    clearInterval(totpInterval);

    document.getElementById('serviceName').textContent = account.service;
    document.getElementById('emailValue').textContent = account.email;
    document.getElementById('usernameValue').textContent = account.username;
    document.getElementById('passwordInput').value = account.password;
    document.getElementById('lastUsed').textContent = account.lastUsed;
    document.getElementById('created').textContent = account.created;

    const totpValue = document.getElementById('totpValue');
    const totpProgress = document.getElementById('totpProgress');
    // Remove any existing countdown text before adding a new one
    const svg = totpProgress.closest('svg');
    let totpCountdown = svg.querySelector('#totpCountdown');
    if (totpCountdown) {
        svg.removeChild(totpCountdown);
    }
    totpCountdown = document.createElementNS("http://www.w3.org/2000/svg", "text");
    totpCountdown.setAttribute("id", "totpCountdown");
    totpCountdown.setAttribute("x", "20");
    totpCountdown.setAttribute("y", "19");
    totpCountdown.setAttribute("text-anchor", "middle");
    totpCountdown.setAttribute("dominant-baseline", "middle");
    totpCountdown.setAttribute("font-size", "16");
    totpCountdown.setAttribute("fill", "#a0aec0");
    totpCountdown.setAttribute("transform", "rotate(0 20 20)");
    svg.appendChild(totpCountdown);

    totpProgress.setAttribute("transform", "rotate(-90 20 20)");

    const CIRCUMFERENCE = 2 * Math.PI * 18; // ≈ 113.1

    async function refreshTotp() {
        const totp = await generateTotp(account.totpSecret);
        const now = Date.now();
        const secondsElapsed = Math.floor((now / 1000) % 30);
        const secondsRemaining = 30 - secondsElapsed;
        const offset = CIRCUMFERENCE - (CIRCUMFERENCE * secondsRemaining) / 30;

        totpValue.textContent = totp;
        totpProgress.setAttribute('stroke-dashoffset', offset);
        totpCountdown.textContent = `${secondsRemaining}`;
    }

    refreshTotp();
    totpInterval = setInterval(refreshTotp, 1000);

    // Reset password field to hidden
    const passwordInput = document.getElementById('passwordInput');
    const eye = document.querySelector('.toggle-eye');
    passwordInput.type = 'password';
    eye.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>`;
    eye.removeEventListener('click', togglePassword);
    eye.addEventListener('click', togglePassword);
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

    // ✅ Password visibility toggle
    const eye = document.querySelector('.toggle-eye');
    if (eye) {
        eye.addEventListener('click', togglePassword);
    }

    // ✅ Click-to-copy password with "bop" notification
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('click', async function () {
            try {
                await navigator.clipboard.writeText(passwordInput.value);

                // Create floating notification
                const notification = document.createElement('div');
                notification.textContent = 'Copied to clipboard';
                notification.className = 'copy-popup';
                document.body.appendChild(notification);

                // Position near password input
                const rect = passwordInput.getBoundingClientRect();
                notification.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
                notification.style.top = `${rect.top + window.scrollY - 30}px`;

                // Animate in and out
                requestAnimationFrame(() => {
                    notification.classList.add('show');
                });

                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => notification.remove(), 200); // allow fade out
                }, 1200);
            } catch (err) {
                console.error('Failed to copy password:', err);
            }
        });
    }

    // ✅ Initialize with the default active account
    const activeItem = document.querySelector('.sidebar-item.active');
    if (activeItem) {
        const accountKey = activeItem.getAttribute('data-account');
        updateDetailPanel(accountKey);
    }
});
