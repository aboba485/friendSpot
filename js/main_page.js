document.addEventListener('DOMContentLoaded', function() {
    setupSearchFunctionality();
    enableInnerScroll(); // Enable inner scroll functionality

    const tg = window.Telegram.WebApp;
    tg.expand();

    const user = tg.initDataUnsafe?.user;
    console.log("User data:", user);

    if (user) {
        const username = user.username; // Using username now

        document.getElementById('username').textContent = username || "No username";

        // Fetch profile photo from the database based on the username
        fetchProfilePhoto(username);

        // Fetch bondmen owned by the user
        fetchBondmen(username);
    } else {
        console.error("User data is not available.");
    }
});

function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    const bondmenList = document.getElementById('bondmenList');
    const bondmen = bondmenList.getElementsByClassName('bondman');
    const noResults = document.getElementById('noResults');

    searchInput.addEventListener('input', function() {
        const filter = searchInput.value.toLowerCase();
        let visibleBondmen = 0;
        Array.from(bondmen).forEach(function(bondman) {
            const handle = bondman.getElementsByTagName('p')[1].textContent.toLowerCase();
            if (handle.indexOf(filter) > -1) {
                bondman.style.display = "flex";
                visibleBondmen++;
            } else {
                bondman.style.display = "none";
            }
        });
        noResults.style.display = visibleBondmen > 0 ? 'none' : 'block';
    });
}

function fetchProfilePhoto(username) {
    fetch(`get_profile.php?username=${username}`)
        .then(response => response.json())
        .then(data => {
            console.log("Profile photo data:", data); // Log the data for debugging
            if (data.error) {
                console.error("Error fetching profile photo:", data.error);
                return;
            }

            const profilePhotoUrl = data.profile_picture;

            if (profilePhotoUrl) {
                document.getElementById('profilePhoto').src = profilePhotoUrl;
                console.log("Profile photo updated successfully:", profilePhotoUrl);
            } else {
                console.log("No profile photo URL available.");
            }
        })
        .catch(error => {
            console.error("Error fetching profile photo:", error);
        });
}

function fetchBondmen(owner) {
    fetch(`get_user_bondmen.php?owner=${owner}`)
        .then(response => response.json())
        .then(data => {
            const bondmenList = document.getElementById('bondmenList');
            bondmenList.innerHTML = ''; // Clear existing bondmen

            if (data.length === 0) {
                document.getElementById('noResults').style.display = 'block';
                return;
            }

            data.forEach(item => {
                const bondmanDiv = document.createElement('div');
                bondmanDiv.className = 'bondman';
                bondmanDiv.setAttribute('data-username', item.nickname);
                bondmanDiv.setAttribute('data-handle', '@' + item.nickname);
                bondmanDiv.setAttribute('data-price', item.price);
                bondmanDiv.setAttribute('data-avatar', item.profile_picture);

                bondmanDiv.innerHTML = `
                    <img src="${item.profile_picture}" alt="User avatar" class="avatar">
                    <div>
                        <p>${item.nickname}</p>
                        <p>@${item.nickname}</p>
                    </div>
                `;

                bondmenList.appendChild(bondmanDiv);
            });

            document.getElementById('noResults').style.display = 'none';
        })
        .catch(error => {
            console.error("Error fetching bondmen:", error);
            document.getElementById('noResults').style.display = 'block';
        });
}

function enableInnerScroll() {
    const bondmenList = document.getElementById('bondmenList');
    
    bondmenList.addEventListener('touchstart', function(event) {
        startY = event.touches[0].pageY;
        scrollTop = this.scrollTop;
    });

    bondmenList.addEventListener('touchmove', function(event) {
        let y = event.touches[0].pageY;
        let walk = startY - y;
        this.scrollTop = scrollTop + walk;
        event.stopPropagation();
    });
}

document.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, { passive: false });

document.addEventListener('scroll', function(event) {
    window.scrollTo(0, 0);
});

document.addEventListener('click', function(event) {
    const searchInput = document.getElementById('searchInput');
    const isClickInside = searchInput.contains(event.target);

    if (!isClickInside) {
        searchInput.blur();
    }
});
