import datetime
import json
from fastapi import FastAPI, Depends, HTTPException, APIRouter
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from pydantic import BaseModel
from typing import List
from database import SessionLocal
from models import Topic, Roadmap, User, Step, Comment, CommentLike, TopicLike,StepMaterial, CommunityRoadmap, Vote, Category
from schemas import RoadmapCreateRequest, StepCreateRequest, StepResponse, CommentCreate, CommentResponse,StepMaterialCreate,StepMaterialOut,StepMaterialUpdate
from schemas import CommunityRoadmapCreate, CommunityRoadmapInDB, CommunityRoadmapUpdate, VoteCreate, VoteInDB, CategoryOut, TopicRead, CategoryWithTopics
from auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user, get_current_user_optional
from typing import Optional
import traceback
from sqlalchemy.orm import joinedload


app = FastAPI()
app.include_router(auth_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Функция для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ========================== ЭНДПОИНТЫ ==========================

# Модель запроса для создания категории
class CategoryCreate(BaseModel):
    name: str

# Создать новую категорию
@app.post("/create_category")
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    try:
        db.execute(text('INSERT INTO "Category" (name) VALUES (:name)'), {"name": category.name})
        db.commit()
        return {"message": "Category created successfully", "category": category.name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create category: {str(e)}")
    
#получение всех категории
@app.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return categories

# Получить все категории с топиками
@app.get("/categories_with_topics", response_model=List[CategoryWithTopics])
def get_categories_with_topics(db: Session = Depends(get_db)):
    categories = db.query(Category).all()  # Получаем все категории из базы данных
    if not categories:
        raise HTTPException(status_code=404, detail="Categories not found")

    # Создаем ответ, который будет включать категорию с её топиками
    result = []
    for category in categories:
        category_data = CategoryWithTopics(
            category_id=category.category_id,
            name=category.name,
            topics=[TopicRead(
                topic_id=topic.topic_id,
                name=topic.name,
                description=topic.description,
                like_count=topic.like_count,
                dislike_count=topic.dislike_count,
                category_id=category.category_id,
                image=topic.image
            ) for topic in sorted(category.topics, key=lambda topic: topic.topic_id)]  # Сортируем топики по topic_id
        )
        result.append(category_data)

    return result

# ====================== БАЙЕСОВСКИЙ АЛГОРИТМ ======================

class RoadmapScoreModel(BaseModel):
    name: str
    likes: int
    dislikes: int

    def dict_with_score(self, C: float = 0.5, m: int = 50):
        bayesian_score = (self.likes + C * m) / (self.likes + self.dislikes + m)
        return {**self.dict(), "bayesian_score": bayesian_score}

class RoadmapListRequest(BaseModel):
    roadmaps: List[RoadmapScoreModel]

@app.post("/rank")
def rank_roadmaps(data: RoadmapListRequest):
    roadmaps_with_scores = [roadmap.dict_with_score() for roadmap in data.roadmaps]
    sorted_roadmaps = sorted(roadmaps_with_scores, key=lambda x: x["bayesian_score"], reverse=True)
    return {"bayesian_ranking": sorted_roadmaps}

# ================ Алгоритм для ранкинга примененный для БД ===================
@app.get("/rank_roadmaps")
def rank_existing_roadmaps(db: Session = Depends(get_db), C: float = 0.5, m: int = 50):
    roadmaps = db.query(Roadmap).all()
    ranked_roadmaps = []

    for r in roadmaps:
        topic = db.query(Topic).filter(Topic.topic_id == r.topic_id).first()
        if not topic:
            continue

        likes = db.query(TopicLike).filter_by(topic_id=topic.topic_id, is_like=True).count()
        dislikes = db.query(TopicLike).filter_by(topic_id=topic.topic_id, is_like=False).count()

        bayesian_score = (likes + C * m) / (likes + dislikes + m) if (likes + dislikes + m) > 0 else 0

        ranked_roadmaps.append({
            "roadmap_id": r.roadmap_id,
            "topic_id": r.topic_id,
            "topic_name": topic.name,
            "likes": likes,
            "dislikes": dislikes,
            "bayesian_score": bayesian_score,
            "created_at": r.created_at
        })


    sorted_roadmaps = sorted(ranked_roadmaps, key=lambda x: x["bayesian_score"], reverse=True)
    return {"bayesian_ranking": sorted_roadmaps}


#============================ ПОЛУЧЕНИЕ ВСЕХ ТОПИКОВ =========================

@app.get("/topics/", response_model=List[TopicRead])
def get_all_topics(db: Session = Depends(get_db)):
    topics = db.query(Topic).order_by(Topic.topic_id).all()
    return topics

# ========================== ЛАЙКИ НА ТОПИК ==========================

@app.post("/topics/{topic_id}/manual_like")
def Manual_like_topic(topic_id: int, db: Session = Depends(get_db)):
    try:
        topic = db.query(Topic).filter(Topic.topic_id == topic_id).first()
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
        topic.like_count += 1
        db.commit()
        return {"message": "Liked!", "like_count": topic.like_count}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to like topic: {str(e)}")


@app.post("/topics/{topic_id}/dislike")
def manual_dislike_topic(topic_id: int, db: Session = Depends(get_db)):
    try:
        topic = db.query(Topic).filter(Topic.topic_id == topic_id).first()
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")

        topic.dislike_count += 1
        db.commit()
        return {"message": "Disliked!", "dislike_count": topic.dislike_count}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to dislike topic: {str(e)}")


# ========================== РОАДМАПЫ ==========================

@app.post("/create_roadmap")
def create_roadmap(request: RoadmapCreateRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.user_id == request.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        topic = db.query(Topic).filter(Topic.topic_id == request.topic_id).first()
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")

        new_roadmap = Roadmap(
            topic_id=request.topic_id,
            user_id=request.user_id,
            created_at=datetime.datetime.utcnow()
        )
        db.add(new_roadmap)
        db.commit()
        db.refresh(new_roadmap)

        return {"message": "Roadmap created successfully", "roadmap": {
            "roadmap_id": new_roadmap.roadmap_id,
            "topic_id": new_roadmap.topic_id,
            "user_id": new_roadmap.user_id,
            "created_at": new_roadmap.created_at
        }}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create roadmap: {str(e)}")


@app.post("/create_step", response_model=StepResponse)
def create_step(step: StepCreateRequest, db: Session = Depends(get_db)):
    try:
        roadmap = db.query(Roadmap).filter(Roadmap.roadmap_id == step.roadmap_id).first()
        if not roadmap:
            raise HTTPException(status_code=404, detail="Roadmap not found")

        if step.parent_step_id:
            parent_step = db.query(Step).filter(Step.step_id == step.parent_step_id).first()
            if not parent_step:
                raise HTTPException(status_code=404, detail="Parent Step not found")

        new_step = Step(
            roadmap_id=step.roadmap_id,
            parent_step_id=step.parent_step_id,
            step_title=step.step_title,
            step_description=step.step_description,
            step_order=step.step_order,
            created_at=datetime.datetime.utcnow()
        )

        db.add(new_step)
        db.commit()
        db.refresh(new_step)
        return new_step
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create step: {str(e)}")


@app.get("/roadmap/{roadmap_id}", response_model=list[StepResponse])
def get_steps_by_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    steps = db.query(Step).filter(Step.roadmap_id == roadmap_id).order_by(Step.step_order).all()
    return steps

# ==================== ДЕРЕВО РОАДМАПОВ С ШАГАМИ ===================================
@app.get("/roadmap_tree/{roadmap_id}")
def get_steps_by_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    steps = db.query(Step).filter(Step.roadmap_id == roadmap_id).order_by(Step.step_order).all()
    materials = db.query(StepMaterial).filter(StepMaterial.roadmap_id == roadmap_id).all()

    # Группируем материалы по step_id
    materials_by_step = {}
    for m in materials:
        m.videos = json.loads(m.videos)
        m.books = json.loads(m.books)
        materials_by_step.setdefault(m.step_id, []).append({
            "material_id": m.material_id,
            "name": m.name,
            "description": m.description,
            "tip": m.tip,
            "videos": m.videos,
            "books": m.books,
            "completed": m.completed
        })

    return build_step_tree(steps, materials_by_step)


def build_step_tree(steps, materials_by_step):
    step_dict = {step.step_id: step for step in steps}
    tree = []

    def serialize(step):
        return {
            "step_id": step.step_id,
            "step_title": step.step_title,
            "step_description": step.step_description,
            "step_order": step.step_order,
            "created_at": step.created_at.strftime("%Y-%m-%d"),
            "parent_step_id": step.parent_step_id,
            "materials": materials_by_step.get(step.step_id, []),
            "children": []
        }

    step_data = {step.step_id: serialize(step) for step in steps}

    for step in steps:
        if step.parent_step_id:
            parent = step_data.get(step.parent_step_id)
            if parent:
                parent["children"].append(step_data[step.step_id])
        else:
            tree.append(step_data[step.step_id])

    return tree


@app.get("/roadmap_tree/{roadmap_id}")
def get_steps_by_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    steps = db.query(Step).filter(Step.roadmap_id == roadmap_id).order_by(Step.step_order).all()
    return build_step_tree(steps)




# =========================== КОММЕНТАРИИ ===========================


@app.post("/comments/", response_model=CommentResponse)
def create_comment(comment: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        parent_comment_id = comment.parent_comment_id if comment.parent_comment_id else None

        new_comment = Comment(
            user_id=current_user.user_id,
            topic_id=comment.topic_id, #comment.roadmap_id надо вернуть
            parent_comment_id=parent_comment_id,
            content=comment.content
        )

        db.add(new_comment)
        db.commit()
        db.refresh(new_comment)
        return new_comment
    except Exception as e:
        db.rollback()
        traceback.print_exc() 
        raise HTTPException(status_code=500, detail=f"Failed to create comment: {str(e)}")


@app.get("/comments/{comment_id}/replies", response_model=List[CommentResponse])
def get_replies(comment_id: int, db: Session = Depends(get_db)):
    replies = db.query(Comment).filter(Comment.parent_comment_id == comment_id).all()
    return replies

# =========================== ДЕРЕВО КОММЕНТАРИЕВ ===========================
def get_comment_likes_count(db: Session, comment_id: int, user_id: int = None):
    likes = db.query(CommentLike).filter(CommentLike.comment_id == comment_id, CommentLike.is_like == True).count()
    dislikes = db.query(CommentLike).filter(CommentLike.comment_id == comment_id, CommentLike.is_like == False).count()

    user_liked = None
    if user_id is not None:
        user_like = db.query(CommentLike).filter(
            CommentLike.comment_id == comment_id,
            CommentLike.user_id == user_id
        ).first()
        if user_like:
            user_liked = user_like.is_like  # True (like), False (dislike)

    return likes, dislikes, user_liked

def build_comment_tree(comments, db, current_user_id=None):
    comment_dict = {comment.comment_id: comment for comment in comments}
    tree = []

    # Шаг 1: заранее сериализуем без parent_username
    comment_data = {}
    for comment in comments:
        likes, dislikes, user_liked = get_comment_likes_count(db, comment.comment_id, current_user_id)
        comment_data[comment.comment_id] = {
            "comment_id": comment.comment_id,
            "username": comment.user.username,
            "text": comment.content,
            "date": comment.created_at.strftime("%Y-%m-%d"),
            "edited": comment.edited,
            "likes": likes,
            "dislikes": dislikes,
            "user_liked": user_liked,
            "parent_username": None,  # временно пусто
            "reply": []
        }

    # Шаг 2: проставляем parent_username теперь, когда все username уже есть
    for comment_id, data in comment_data.items():
        comment = comment_dict[comment_id]
        parent_id = comment.parent_comment_id
        if parent_id:
            parent = comment_data.get(parent_id)
            if parent:
                data["parent_username"] = parent.get("username")

    # Шаг 3: собираем дерево
    for comment in comments:
        if comment.parent_comment_id:
            parent = comment_data.get(comment.parent_comment_id)
            if parent:
                parent["reply"].append(comment_data[comment.comment_id])
        else:
            tree.append(comment_data[comment.comment_id])

    return tree


@app.get("/comments_tree/{topic_id}") 
def get_comments(
    topic_id: int,  
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    comments = db.query(Comment)\
    .options(joinedload(Comment.user), joinedload(Comment.parent).joinedload(Comment.user))\
    .filter(Comment.topic_id == topic_id)\
    .order_by(Comment.created_at)\
    .all()
    user_id = current_user.user_id if current_user else None
    return build_comment_tree(comments, db, current_user_id=user_id)


# =========================== ЛАЙКИ ТОПИКОВ ДЛЯ ЮЗЕРОВ ===========================

@app.post("/topics/{topic_id}/like")
def like_topic(topic_id: int, is_like: bool, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        topic_like = db.query(TopicLike).filter_by(user_id=current_user.user_id, topic_id=topic_id).first()
        if topic_like:
            topic_like.is_like = is_like
        else:
            topic_like = TopicLike(user_id=current_user.user_id, topic_id=topic_id, is_like=is_like)
            db.add(topic_like)
        db.commit()
        return {"message": "Лайк/дизлайк темы успешно сохранён."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка при лайке темы: {str(e)}")



@app.get("/topics/{topic_id}/likes")
def get_topic_likes(topic_id: int, db: Session = Depends(get_db)):
    likes = db.query(TopicLike).filter_by(topic_id=topic_id, is_like=True).count()
    dislikes = db.query(TopicLike).filter_by(topic_id=topic_id, is_like=False).count()
    return {"likes": likes, "dislikes": dislikes}

# =========================== ЛАЙКИ КОММЕНТАРИЕВ ===========================
class LikeRequest(BaseModel):
    is_like: Optional[bool]

@app.post("/comments/{comment_id}/like")
def like_comment(comment_id: int, like_data: LikeRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        is_like = like_data.is_like
        comment_like = db.query(CommentLike).filter_by(user_id=current_user.user_id, comment_id=comment_id).first()
        if comment_like:
            comment_like.is_like = is_like
        else:
            comment_like = CommentLike(user_id=current_user.user_id, comment_id=comment_id, is_like=is_like)
            db.add(comment_like)
        db.commit()
        return {"message": "Лайк/дизлайк комментария успешно сохранён."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка при лайке комментария: {str(e)}")



@app.get("/comments/{comment_id}/likes")
def get_comment_likes(comment_id: int, db: Session = Depends(get_db)):
    likes = db.query(CommentLike).filter_by(comment_id=comment_id, is_like=True).count()
    dislikes = db.query(CommentLike).filter_by(comment_id=comment_id, is_like=False).count()
    return {"likes": likes, "dislikes": dislikes}

# ============= ШАГИ И МАТЕРИАЛЫ ===========================================


@app.get("/step-materials", response_model=List[StepMaterialOut])
def get_all_step_materials(db: Session = Depends(get_db)):
    materials = db.query(StepMaterial).all()
    for m in materials:
        m.videos = json.loads(m.videos)
        m.books = json.loads(m.books)
    return materials

@app.get("/step-materials/{material_id}", response_model=StepMaterialOut)
def get_step_material(material_id: int, db: Session = Depends(get_db)):
    material = db.query(StepMaterial).filter(StepMaterial.material_id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Step material not found")
    material.videos = json.loads(material.videos)
    material.books = json.loads(material.books)
    return material

# POST — создание
@app.post("/step-materials", response_model=StepMaterialOut)
def create_step_material(material: StepMaterialCreate, db: Session = Depends(get_db)):
    try:
        db_material = StepMaterial(
            roadmap_id=material.roadmap_id,
            step_id=material.step_id,
            name=material.name,
            description=material.description,
            tip=material.tip,
            videos=json.dumps(material.videos),
            books=json.dumps(material.books),
            completed=material.completed
        )
        db.add(db_material)
        db.commit()
        db.refresh(db_material)
        return db_material
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка при создании материала: {str(e)}")


# PUT — обновление
@app.put("/step-materials/{material_id}", response_model=StepMaterialOut)
def update_step_material(material_id: int, update: StepMaterialUpdate, db: Session = Depends(get_db)):
    material = db.query(StepMaterial).filter(StepMaterial.material_id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Step material not found")

    try:
        if update.name is not None:
            material.name = update.name
        if update.description is not None:
            material.description = update.description
        if update.tip is not None:
            material.tip = update.tip
        if update.videos is not None:
            material.videos = json.dumps(update.videos)
        if update.books is not None:
            material.books = json.dumps(update.books)
        if update.completed is not None:
            material.completed = update.completed

        db.commit()
        db.refresh(material)
        return material
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка при обновлении материала: {str(e)}")


# DELETE — удаление
@app.delete("/step-materials/{material_id}")
def delete_step_material(material_id: int, db: Session = Depends(get_db)):
    material = db.query(StepMaterial).filter(StepMaterial.material_id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Step material not found")

    try:
        db.delete(material)
        db.commit()
        return {"detail": "Step material deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка при удалении материала: {str(e)}")

#========= CommunityRoadmap ================================================================

# Создать CommunityRoadmap
@app.post("/community_roadmap/", response_model=CommunityRoadmapInDB)
def create_community_roadmap(
    community_roadmap: CommunityRoadmapCreate, db: Session = Depends(get_db)
):
    db_community_roadmap = CommunityRoadmap(**community_roadmap.dict())
    db.add(db_community_roadmap)
    db.commit()
    db.refresh(db_community_roadmap)
    return db_community_roadmap

# Получить все CommunityRoadmaps
@app.get("/community_roadmaps/", response_model=list[CommunityRoadmapInDB])
def get_community_roadmaps(db: Session = Depends(get_db)):
    db_community_roadmaps = db.execute(select(CommunityRoadmap)).scalars().all()
    return db_community_roadmaps

# Получить CommunityRoadmap по ID
@app.get("/community_roadmap/{c_roadmap_id}", response_model=CommunityRoadmapInDB)
def get_community_roadmap(c_roadmap_id: int, db: Session = Depends(get_db)):
    db_community_roadmap = db.query(CommunityRoadmap).filter(CommunityRoadmap.c_roadmap_id == c_roadmap_id).first()
    if db_community_roadmap is None:
        raise HTTPException(status_code=404, detail="CommunityRoadmap not found")
    return db_community_roadmap

# Обновить CommunityRoadmap
@app.put("/community_roadmap/{c_roadmap_id}", response_model=CommunityRoadmapInDB)
def update_community_roadmap(
    c_roadmap_id: int, community_roadmap: CommunityRoadmapUpdate, db: Session = Depends(get_db)
):
    db_community_roadmap = db.query(CommunityRoadmap).filter(CommunityRoadmap.c_roadmap_id == c_roadmap_id).first()
    if db_community_roadmap is None:
        raise HTTPException(status_code=404, detail="CommunityRoadmap not found")
    
    for key, value in community_roadmap.dict(exclude_unset=True).items():
        setattr(db_community_roadmap, key, value)

    db.commit()
    db.refresh(db_community_roadmap)
    return db_community_roadmap

# Удалить CommunityRoadmap
@app.delete("/community_roadmap/{c_roadmap_id}")
def delete_community_roadmap(c_roadmap_id: int, db: Session = Depends(get_db)):
    db_community_roadmap = db.query(CommunityRoadmap).filter(CommunityRoadmap.c_roadmap_id == c_roadmap_id).first()
    if db_community_roadmap is None:
        raise HTTPException(status_code=404, detail="CommunityRoadmap not found")

    db.delete(db_community_roadmap)
    db.commit()
    return {"message": "CommunityRoadmap deleted successfully"}

# =========== VOTE for COMMUNITY ROADMAP ================================


# Создать голосование
@app.post("/vote/", response_model=VoteInDB)
def create_vote(vote: VoteCreate, db: Session = Depends(get_db)):
    # Проверяем, если пользователь уже голосовал за этот community_roadmap
    existing_vote = db.query(Vote).filter(
        Vote.user_id == vote.user_id, Vote.c_roadmap_id == vote.c_roadmap_id
    ).first()
    if existing_vote:
        raise HTTPException(status_code=400, detail="User has already voted on this roadmap")

    db_vote = Vote(**vote.dict())
    db.add(db_vote)
    db.commit()
    db.refresh(db_vote)

    # Обновляем количество голосов в CommunityRoadmap
    community_roadmap = db.query(CommunityRoadmap).filter(
        CommunityRoadmap.c_roadmap_id == vote.c_roadmap_id
    ).first()
    if community_roadmap:
        community_roadmap.update_votes()  # Обновляем голоса
        db.commit()
    
    return db_vote

# Получить все голоса для конкретного CommunityRoadmap
@app.get("/votes/{c_roadmap_id}", response_model=list[VoteInDB])
def get_votes_by_roadmap(c_roadmap_id: int, db: Session = Depends(get_db)):
    votes = db.query(Vote).filter(Vote.c_roadmap_id == c_roadmap_id).all()
    return votes

# Получить голос по ID
@app.get("/vote/{vote_id}", response_model=VoteInDB)
def get_vote(vote_id: int, db: Session = Depends(get_db)):
    vote = db.query(Vote).filter(Vote.vote_id == vote_id).first()
    if vote is None:
        raise HTTPException(status_code=404, detail="Vote not found")
    return vote

# Удалить голос
@app.delete("/vote/{vote_id}")
def delete_vote(vote_id: int, db: Session = Depends(get_db)):
    vote = db.query(Vote).filter(Vote.vote_id == vote_id).first()
    if vote is None:
        raise HTTPException(status_code=404, detail="Vote not found")

    db.delete(vote)
    db.commit()

    # Обновляем количество голосов в CommunityRoadmap
    community_roadmap = db.query(CommunityRoadmap).filter(
        CommunityRoadmap.c_roadmap_id == vote.c_roadmap_id
    ).first()
    if community_roadmap:
        community_roadmap.update_votes()  # Обновляем голоса
        db.commit()

    return {"message": "Vote deleted successfully"}
