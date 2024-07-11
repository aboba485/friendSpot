document.addEventListener('DOMContentLoaded', function() {
    enableInnerScroll();
    checkQuestStatus();
});

function checkQuestStatus() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    fetch(`check_subscription.php?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            const button = document.getElementById('telegram-subscribe-button');
            updateButtonState(button, data.subscribed, data.already_claimed);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function updateButtonState(button, subscribed, alreadyClaimed) {
    button.onclick = null; // Remove existing click listeners

    if (alreadyClaimed) {
        button.textContent = 'CLAIMED';
        button.disabled = true;
        button.classList.remove('go-button', 'check-button', 'prize-button');
        button.classList.add('claimed-button');
    } else if (subscribed) {
        button.textContent = 'PRIZE';
        button.classList.remove('go-button', 'check-button', 'claimed-button');
        button.classList.add('prize-button');
        button.onclick = giveRandomPrize;
    } else {
        button.textContent = 'GO';
        button.disabled = false;
        button.classList.remove('check-button', 'prize-button', 'claimed-button');
        button.classList.add('go-button');
        button.onclick = () => {
            window.open('https://t.me/friend_spot', '_blank');
            button.textContent = 'CHECK';
            button.classList.remove('go-button');
            button.classList.add('check-button');
            button.onclick = checkSubscription;
        };
    }
}

function checkSubscription() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    fetch(`check_subscription.php?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            const button = document.getElementById('telegram-subscribe-button');
            updateButtonState(button, data.subscribed, data.already_claimed);
            if (!data.subscribed) {
                alert('You are not subscribed to the channel yet. Please subscribe and try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while checking your subscription. Please try again later.');
        });
}

function giveRandomPrize() {
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    fetch('claim_prize.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `user_id=${userId}&quest_id=telegram_subscribe`
    })
    .then(response => response.json())
    .then(data => {
        const button = document.getElementById('telegram-subscribe-button');
        if (data.success) {
            alert(`Congratulations! You won a ${data.prize}!`);
            updateButtonState(button, true, true);
        } else {
            alert(data.message || 'An error occurred while claiming the prize.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while claiming the prize. Please try again later.');
    });
}

function enableInnerScroll() {
    const taskContainer = document.querySelector('.task-container');
    let startY, scrollTop;
    
    taskContainer.addEventListener('touchstart', function(event) {
        startY = event.touches[0].pageY;
        scrollTop = this.scrollTop;
    });

    taskContainer.addEventListener('touchmove', function(event) {
        let y = event.touches[0].pageY;
        let walk = startY - y;
        this.scrollTop = scrollTop + walk;
        event.stopPropagation();
    });
}

// Prevent scrolling on the main page
document.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, { passive: false });

document.addEventListener('scroll', function(event) {
    window.scrollTo(0, 0);
});