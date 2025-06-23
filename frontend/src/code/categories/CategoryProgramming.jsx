import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './CategoryProgramming.css';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import RoadmapContainer from '../roadmap/RoadmapContainer';
import footerImage1 from '../../assets/footer-image1.png';

function CategoryProgramming() {
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("http://127.0.0.1:8000/categories_with_topics");
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();
                const programmingCategory = data.find(cat => cat.name.toLowerCase() === 'programming');
                setCategory(programmingCategory || null);
            } catch (error) {
                setError(error.message);
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategory();
    }, []);

    return (
        <div className='category-body'>
            <Header />
            <section className="intro-section">
                <h1>Master the Art of Programming</h1>
                <p>
                    Unlock the power of code with our curated programming roadmaps. From Python to Java, our community-driven 
                    paths guide you through every step of your coding journey. Explore, learn, and build the future—start today!
                </p>
                <hr className="section-divider" />
            </section>
            <RoadmapContainer category={category} isLoading={isLoading} error={error} />
            <section className="skills-section">
                <h2>Key Programming Skills</h2>
                <div className="skills-grid">
                    <div className="skill-card">
                        <h3>Algorithms & Data Structures</h3>
                        <p>Master the foundations of efficient coding with sorting, searching, and graph algorithms.</p>
                    </div>
                    <div className="skill-card">
                        <h3>Web Development</h3>
                        <p>Build dynamic websites with HTML, CSS, JavaScript, and modern frameworks.</p>
                    </div>
                    <div className="skill-card">
                        <h3>Data Science</h3>
                        <p>Analyze and visualize data using Python, R, and machine learning tools.</p>
                    </div>
                </div>
            </section>
            <section className="resources-section">
                <h2>Recommended Resources</h2>
                <div className="resources-grid">
                    <div className="resource-card">
                        <h3>Books</h3>
                        <p>"Clean Code" by Robert C. Martin, "Introduction to Algorithms" by Thomas H. Cormen.</p>
                    </div>
                    <div className="resource-card">
                        <h3>Websites</h3>
                        <p>LeetCode for coding practice, freeCodeCamp for tutorials.</p>
                    </div>
                    <div className="resource-card">
                        <h3>Tools</h3>
                        <p>VS Code for editing, Git for version control.</p>
                    </div>
                </div>
            </section>
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Contribute & Grow</h2>
                    <p>
                        Share your expertise by contributing to our programming roadmaps or explore other exciting categories 
                        to broaden your skills. Join our community today!
                    </p>
                    <button 
                        className="cta-button"
                        onClick={() => navigate('/categories')}
                        aria-label="Explore other categories"
                    >
                        Explore More
                    </button>
                </div>
            </section>
            <img 
                src={footerImage1} 
                className='category-footer-image' 
                alt="Footer decoration"
                loading="lazy"
            />
            <Footer />
        </div>
    );
}

export default CategoryProgramming;