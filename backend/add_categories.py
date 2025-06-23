from sqlalchemy.orm import Session
from database import SessionLocal
from models import Category, Topic

# Открываем сессию
db: Session = SessionLocal()

# 1. Создаём категорию, если не существует
category_name = "Creative Skills"
category = db.query(Category).filter_by(name=category_name).first()

if not category:
    category = Category(name=category_name)
    db.add(category)
    db.commit()
    db.refresh(category)

# 2. Обновлённый список топиков
creative_topics = [
    {
        "name": "Piano",
        "description": "Learn to play the piano step-by-step, starting with key names, finger exercises, and basic music reading. This roadmap will guide you through chords, scales, and beginner songs using popular online platforms, video tutorials, and free sheet music resources."
    },
    {
        "name": "Singing",
        "description": "Develop your vocal range, breath control, and tone quality through structured video courses and vocal warmups. This roadmap focuses on ear training, pitch accuracy, and style variation (pop, classical, etc.) using online lessons, karaoke platforms, and vocal practice tools."
    },
    {
        "name": "Guitar",
        "description": "Master the basics of guitar playing, including how to hold the guitar, strumming techniques, tuning, and basic chords. This roadmap includes lessons on acoustic and electric guitar, tablature reading, and practice routines to help you learn songs and build finger strength efficiently."
    },
    {
        "name": "Digital Drawing",
        "description": "Explore the world of digital illustration using tools like Procreate, Krita, or Adobe Photoshop. Learn line art, shading, coloring, and layering techniques while following structured online courses, YouTube tutorials, and daily drawing challenges to boost your creativity."
    },
    {
        "name": "Creative Writing",
        "description": "Strengthen your ability to tell compelling stories through exercises in world-building, character development, and narrative pacing. This roadmap provides writing prompts, online guides, and structured steps to improve grammar, style, and storytelling in both fiction and nonfiction."
    },
    {
        "name": "Music Theory",
        "description": "Understand the fundamentals of music through interactive lessons on rhythm, scales, chords, harmony, and time signatures. This roadmap combines theoretical knowledge with ear training and practical applications that support your growth as a well-rounded musician or composer."
    }
]

# 3. Добавляем топики
for topic_data in creative_topics:
    existing_topic = db.query(Topic).filter_by(name=topic_data["name"]).first()
    if not existing_topic:
        new_topic = Topic(
            name=topic_data["name"],
            description=topic_data["description"],
            category_id=category.category_id
        )
        db.add(new_topic)

db.commit()

# 4. Проверяем
category = db.query(Category).filter_by(name=category_name).first()
print(f"Топики в категории '{category.name}': {[topic.name for topic in category.topics]}")

# Закрываем сессию
db.close()
