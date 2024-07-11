document.addEventListener('DOMContentLoaded', function() {
    const tg = window.Telegram.WebApp;
    tg.expand();

    const user = tg.initDataUnsafe?.user;
    console.log("User data:", user);

    if (!user) {
        console.error("User data is not available.");
        return;
    }

    const searchInput = document.getElementById('searchInput');
    const bondmenList = document.getElementById('bondmenList');
    const bondmen = bondmenList.getElementsByClassName('bondman');
    const popup = document.getElementById('popup');
    const popupAvatar = document.getElementById('popupAvatar');
    const popupUsername = document.getElementById('popupUsername');
    const popupHandle = document.getElementById('popupHandle');
    const popupPrice = document.getElementById('popupPrice');
    const close = document.getElementsByClassName('close')[0];
    const buyButton = document.getElementsByClassName('buy-button')[0]; // Get the buy button

    let currentBondman = null; // Variable to store the current bondman

    // Search functionality
    searchInput.addEventListener('input', function() {
        const filter = searchInput.value.toLowerCase();
        Array.from(bondmen).forEach(function(bondman) {
            const handle = bondman.getElementsByTagName('p')[1].textContent.toLowerCase();
            if (handle.indexOf(filter) > -1) {
                bondman.style.display = "flex";
            } else {
                bondman.style.display = "none";
            }
        });
    });

    // Popup functionality
    Array.from(bondmen).forEach(function(bondman) {
        bondman.addEventListener('click', function() {
            const username = bondman.getAttribute('data-username');
            const handle = bondman.getAttribute('data-handle');
            const price = bondman.getAttribute('data-price');
            const avatar = bondman.getAttribute('data-avatar');

            popupUsername.textContent = username;
            popupHandle.textContent = handle;
            popupPrice.textContent = price; // Ensure price is formatted
            popupAvatar.src = avatar;

            currentBondman = bondman; // Store the current bondman

            popup.style.display = "block";
        });
    });

    buyButton.addEventListener('click', function() {
        const username = popupUsername.textContent;

        fetch('buy_item.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `nickname=${username}&new_owner=${user.username}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update the bondman owner and price
                if (currentBondman) {
                    let newPrice = (parseFloat(popupPrice.textContent) * 1.20).toFixed(2); // Ensure price is formatted
                    if (newPrice.length > 5) {
                        newPrice = parseFloat(newPrice).toPrecision(5);
                    }
                    // Remove trailing zeros
                    newPrice = parseFloat(newPrice).toString();
                    currentBondman.setAttribute('data-price', newPrice);
                    currentBondman.querySelector('.price p').textContent = newPrice;
                }
                popup.style.display = "none";
            } else {
                console.error('Purchase failed:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    close.addEventListener('click', function() {
        popup.style.display = "none";
    });

    window.addEventListener('click', function(event) {
        if (event.target == popup) {
            popup.style.display = "none";
        }
    });

    // Hide keyboard functionality
    document.addEventListener('click', function(event) {
        const isClickInside = searchInput.contains(event.target);

        if (!isClickInside) {
            searchInput.blur();
        }
    });

    // Prevent scrolling on the main page
    document.addEventListener('touchmove', function(event) {
        event.preventDefault();
    }, { passive: false });

    document.addEventListener('scroll', function(event) {
        window.scrollTo(0, 0);
    });

    // Allow scrolling inside the bondmen-list
    enableInnerScroll();
});

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
