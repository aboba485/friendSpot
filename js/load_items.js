document.addEventListener('DOMContentLoaded', function() {
    fetch('get_items.php')
        .then(response => response.json())
        .then(data => {
            const bondmenList = document.getElementById('bondmenList');
            data.forEach(item => {
                // Преобразуем цену в строку и оставляем только 5 символов
                let priceString = parseFloat(item.price).toFixed(2).toString();
                if (priceString.length > 5) {
                    priceString = parseFloat(priceString).toPrecision(5);
                }
                // Убираем нули в конце
                priceString = parseFloat(priceString).toString();
                console.log(`Original price: ${item.price}, Formatted price: ${priceString}`);
                
                const bondmanDiv = document.createElement('div');
                bondmanDiv.className = 'bondman';
                bondmanDiv.setAttribute('data-username', item.nickname);
                bondmanDiv.setAttribute('data-handle', '@' + item.nickname);
                bondmanDiv.setAttribute('data-price', priceString);
                bondmanDiv.setAttribute('data-avatar', item.profile_picture);

                bondmanDiv.innerHTML = `
                    <img src="${item.profile_picture}" alt="User avatar" class="avatar">
                    <div>
                        <p>${item.nickname}</p>
                        <p>@${item.nickname}</p>
                    </div>
                    <div class="price">
                        <p>${priceString}</p>
                        <img src="images/ton.png" alt="TON icon" class="ton-icon">
                    </div>
                `;

                bondmenList.appendChild(bondmanDiv);

                // Re-apply event listeners for the newly added bondmen
                bondmanDiv.addEventListener('click', function() {
                    const username = bondmanDiv.getAttribute('data-username');
                    const handle = bondmanDiv.getAttribute('data-handle');
                    const price = bondmanDiv.getAttribute('data-price');
                    const avatar = bondmanDiv.getAttribute('data-avatar');

                    document.getElementById('popupUsername').textContent = username;
                    document.getElementById('popupHandle').textContent = handle;
                    document.getElementById('popupPrice').textContent = price; // Ensure price is formatted
                    document.getElementById('popupAvatar').src = avatar;

                    document.getElementById('popup').style.display = "block";
                });
            });
        })
        .catch(error => {
            console.error('Error fetching items:', error);
        });
});
