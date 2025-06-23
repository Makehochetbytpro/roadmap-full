import React from 'react';
import { useNavigate } from 'react-router-dom';
import likeIconWhite from '../../assets/like-white.png';
import dislikeIconWhite from '../../assets/dislike-white.png';
import javaGradient from '../../assets/programming/java-gradient.png';
import pythonGradient from '../../assets/programming/python-gradient.png';
import phpGradient from '../../assets/programming/php-gradient.png';
import cPlusPlusGradient from '../../assets/programming/c++-gradient.png';
import cSharpGradient from '../../assets/programming/c-sharp-gradient.png';
import goGradient from '../../assets/programming/go-gradient.png';
import './RoadmapContainer.css';

function RoadmapContainer({ category, isLoading, error }) {
    const navigate = useNavigate();
    const boxesBackground = ['#465E71', '#253B4C'];
    const languageImageMap = {
        "C++": cPlusPlusGradient,
        "C#": cSharpGradient,
        "Python": pythonGradient,
        "PHP": phpGradient,
        "Go": goGradient,
        "Java": javaGradient
    };

    return (
        <div className='main-roadmaps-container-main'>
            {isLoading ? (
                <div className="loading-container">Loading...</div>
            ) : error ? (
                <div className="error-container">Error: {error}</div>
            ) : !category || !category.topics || category.topics.length === 0 ? (
                <div className="empty-container">No topics available</div>
            ) : (
                <section 
                    className='main-roadmap-container-main' 
                    style={{ backgroundColor: boxesBackground[0] }}
                    aria-label={`Category: ${category.name}`}
                >
                    <h2 className='main-container-name'>{category.name}</h2>
                    <div className="main-roadmap-boxes">
                        {category.topics.map((topic) => (
                            <article 
                                key={topic.name} 
                                className="main-roadmap-box"
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => e.key === 'Enter' && navigate('/topic', { 
                                    state: { topic, category_name: category.name }
                                })}
                            >
                                <div 
                                    className='main-roadmap-image' 
                                    onClick={() => navigate('/topic', { 
                                        state: { topic, category_name: category.name }
                                    })}
                                    aria-label={`View ${topic.name} topic`}
                                >
                                    <img 
                                        src={languageImageMap[topic.name]} 
                                        className='main-roadmap-image-background'
                                        alt={`${topic.name} logo`}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="main-roadmap-info-container">
                                    <h3 className='main-roadmap-name'>{topic.name}</h3>
                                    <div className='main-feedback-container'>
                                        <div className='main-like-container'>
                                            <span className="main-like-number">{topic.like_count}</span>
                                            <img 
                                                src={likeIconWhite} 
                                                className="main-heart" 
                                                alt="Like icon"
                                            />
                                        </div>
                                        <div className='main-save-container'>
                                            <div className="main-like-container">
                                                <span className="main-like-number">{topic.dislike_count}</span>
                                                <img 
                                                    src={dislikeIconWhite} 
                                                    className="main-heart" 
                                                    alt="Dislike icon"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default RoadmapContainer;