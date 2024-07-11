#7250358963:AAHTuzhs8qO8ZV5bOfWQQr133WYzFI0Y3MM
import telebot
import sqlite3
import os
from PIL import Image, ImageDraw, ImageFont
import random

TOKEN = '7250358963:AAHTuzhs8qO8ZV5bOfWQQr133WYzFI0Y3MM'
bot = telebot.TeleBot(TOKEN)

# Database setup
db_path = 'main.db'
default_price = 100
default_owner = "none"

# Ensure the profile_pictures directory exists
profile_pictures_dir = 'profile_pictures'
os.makedirs(profile_pictures_dir, exist_ok=True)

# Function to create a default profile picture
def create_default_profile_picture(username):
    colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FF8C33", "#33FFF5", "#8C33FF", "#FFC733"]
    color = random.choice(colors)
    image = Image.new('RGB', (200, 200), color)
    draw = ImageDraw.Draw(image)
    font_path = "fonts/Roboto-Regular.ttf"  # Ensure this path is correct
    font_size = 100
    font = ImageFont.truetype(font_path, font_size)
    text = username[0].upper()
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((200 - text_width) // 2, (150 - text_height) // 2)
    draw.text(position, text, (255, 255, 255), font=font)
    return image

# Command handler for /start
@bot.message_handler(commands=['start'])
def start(message):
    user = message.from_user
    username = user.username
    name = user.full_name if user.full_name else f"{user.first_name} {user.last_name}"

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # Check if user already exists
    c.execute('SELECT COUNT(*) FROM users WHERE username = ?', (username,))
    user_exists = c.fetchone()[0] > 0

    # Check if item already exists
    c.execute('SELECT COUNT(*) FROM item WHERE nickname = ?', (username,))
    item_exists = c.fetchone()[0] > 0

    if not user_exists:
        # Get user profile photos
        photos = bot.get_user_profile_photos(user.id)

        if photos.total_count > 0:
            # Get the highest resolution photo available
            photo_id = photos.photos[0][-1].file_id
            file_info = bot.get_file(photo_id)
            file = bot.download_file(file_info.file_path)
            # Save the photo to the profile_pictures directory
            photo_path = os.path.join(profile_pictures_dir, f"{username}.png")
            with open(photo_path, 'wb') as f:
                f.write(file)
            print(f"Saved profile picture for {username} at {photo_path}")
        else:
            # Create a default profile picture
            image = create_default_profile_picture(username)
            photo_path = os.path.join(profile_pictures_dir, f"{username}.png")
            image.save(photo_path)

        # Insert user in the database
        c.execute('''
        INSERT INTO users (username, name, profile_picture)
        VALUES (?, ?, ?)
        ''', (username, name, photo_path))

    if not item_exists:
        # Insert item in the database
        c.execute('''
        INSERT INTO item (nickname, profile_picture, owner, price)
        VALUES (?, ?, ?, ?)
        ''', (username, photo_path, default_owner, default_price))

    conn.commit()
    conn.close()

    # Create a web app button
    web_app_info = telebot.types.WebAppInfo("https://friendspott.000webhostapp.com")
    markup = telebot.types.InlineKeyboardMarkup()
    markup.add(telebot.types.InlineKeyboardButton("Play! 🚀", web_app=web_app_info))
    
    bot.send_message(message.chat.id, 'Click below to play!', reply_markup=markup)

if __name__ == '__main__':
    bot.polling()
