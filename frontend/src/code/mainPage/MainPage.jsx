import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import FeaturesSection from "./FeaturesSection";
import mainPageImage from '../../assets/main-page-image.png';
import footerImage1 from '../../assets/footer-image1.png';
import likeIconWhite from '../../assets/like-white.png';
import dislikeIconWhite from '../../assets/dislike-white.png';
import javaGradient from '../../assets/programming/java-gradient.png';
import pythonGradient from '../../assets/programming/python-gradient.png';
import phpGradient from '../../assets/programming/php-gradient.png';
import cPlusPlusGradient from '../../assets/programming/c++-gradient.png';
import cSharpGradient from '../../assets/programming/c-sharp-gradient.png';
import goGradient from '../../assets/programming/go-gradient.png';
import community from '../../assets/background-image-videohub.jpg';
import russian from '../../assets/russian.png';
import english from '../../assets/english.png';
import chinese from '../../assets/chinese.png';
import french from '../../assets/french.png';
import spanish from '../../assets/spanish.png';

function MainPage() {
    const navigate = useNavigate();
    const [arrayOfCategory, setArrayOfCategory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const boxesBackground = ['#465E71', '#253B4C'];
    const languageImageMap = {
        "C++": cPlusPlusGradient,
        "C#": cSharpGradient,
        "Python": pythonGradient,
        "PHP": phpGradient,
        "Go": goGradient,
        "Java": javaGradient,
        "Russian": russian,
        "English": english,
        "Chinese": chinese,
        "French": french,
        "Spanish": spanish
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("http://127.0.0.1:8000/categories_with_topics");
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();
                setArrayOfCategory(data);
                console.log(data)
            } catch (error) {
                setError(error.message);
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className='main-body'>
            <Header />
            <img 
                src={mainPageImage} 
                className='main-page-image' 
                alt="Main page banner"
                loading="lazy"
            />
            <section className="intro-section">
                <h1>Embark on Your Learning Adventure</h1>
                <p>
                    Dive into a world of knowledge with our curated roadmaps for programming, music, art, and more. 
                    Whether you're a beginner or a seasoned enthusiast, our community-driven platform empowers you to 
                    explore, learn, and grow. Share your insights, vote on roadmap updates, and connect with passionate 
                    learners worldwide. Your journey to mastery starts here—join us today!
                </p>
                <hr className="section-divider" />
            </section>
            <section className="community-section">
                <div className="community-content">
                    <div className="community-text">
                        <h2>Join Our Vibrant Community</h2>
                        <p>
                            Connect with like-minded learners from around the globe. Share your expertise, discuss challenges, 
                            and collaborate on improving roadmaps. Our platform thrives on the passion and contributions of our 
                            community—become a part of it and make a difference!
                        </p>
                    </div>
                    <div className="community-visual">
                        <div className="visual-placeholder"><img style={{height:'98%', width:'98%', objectFit: 'cover', borderRadius: '0.3vw'}} src={community}></img></div>
                    </div>
                </div>
            </section>
            <section className="features-tree-section">
                <div className="features-tree-question">Why Choose Our Platform?</div>
                <div style={{border: "2px solid #00d4b4", borderRadius: '15px', top: '8vw', width: '100%', height: '72vw', position: 'absolute'}}></div>
                <div className="circle-wrapper">
                    <div className="feature-tree-first-circle"></div>
                    <div className="feature-tree-first-line"></div>
                    <div className="feature-tree-first-circle" style={{top: "calc( 25.95vw)", left: "calc(36.95vw)", height: "10vw", width: "10vw"}}></div>
                    <div className="feature-tree-second-line" style={{top: "calc( 25.95vw + 5vw)", left: "calc(36.95vw + 5vw)"}}></div>
                    <div className="feature-tree-first-circle" style={{top: "calc( 55.84vw)", left: "calc(24.27vw)", height: "8vw", width: "8vw"}}></div>
                </div>
                <div className="curated-roadmaps">
                    <div className="curated-roadmaps-name">Curated Roadmaps</div>
                    <div className="curated-roadmaps-text">Explore expertly crafted learning paths tailored to your interests.</div>
                </div>
                <div className="community-voting">
                    <div className="community-voting-name">Community Voting</div>
                    <div className="community-voting-text">Vote on roadmap updates to keep content relevant and engaging.</div>
                </div>
                <div className="interactive-learning">
                    <div className="interactive-learning-name">Interactive Learning</div>
                    <div className="interactive-learning-text">Engage with a supportive community through feedback and discussions.</div>
                </div>    
            </section>
            <section className="testimonials-section">
                <h2>What Our Users Say</h2>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <p>"This platform transformed how I learn programming. The roadmaps are clear, and the community is incredibly supportive!"</p>
                        <span>— Jane D.</span>
                    </div>
                    <div className="testimonial-card">
                        <p>"I love contributing to music roadmaps and seeing my ideas come to life."</p>
                        <span>— Alex R.</span>
                    </div>
                    <div className="testimonial-card">
                        <p>"A game-changer for self-learners. The voting system keeps the content fresh!"</p>
                        <span>— Sam K.</span>
                    </div>
                </div>
            </section>
            <div className='main-roadmaps-container-main'>
                {isLoading ? (
                    <div className="loading-container">Loading...</div>
                ) : error ? (
                    <div className="error-container">Error: {error}</div>
                ) : arrayOfCategory.length === 0 ? (
                    <div className="empty-container">No categories available</div>
                ) : (
                    arrayOfCategory.map((category, index) => (
                        <section 
                            key={category.name} 
                            className='main-roadmap-container-main' 
                            style={{ backgroundColor: boxesBackground[index % boxesBackground.length] }}
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
                    ))
                )}
            </div>
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Start Your Journey Today</h2>
                    <p>
                        Ready to dive into your passions? Explore our curated roadmaps and join a community of learners 
                        dedicated to growth and collaboration. Your next big achievement is just a click away!
                    </p>
                    <button 
                        className="cta-button"
                        onClick={() => navigate('/categories')}
                        aria-label="Explore learning categories"
                    >
                        Explore Now
                    </button>
                </div>
            </section>
            <img 
                src={footerImage1} 
                className='main-footer-image' 
                alt="Footer decoration"
                loading="lazy"
            />
            <Footer />
        </div>
    );
}

export default MainPage;