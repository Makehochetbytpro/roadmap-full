import { useState } from 'react';
import './AboutUsPage.css';
import Header from '../header/Header'
import img1 from '../../assets/about-us-img1.png';
import img2 from '../../assets/about-us-img2.png';
import img3 from '../../assets/about-us-img3.png';
import img4 from '../../assets/about-us-img4.png';
import spots from '../../assets/spots.png';
import programming from '../../assets/programming.png';
import points from '../../assets/points.png';
import reward from '../../assets/reward.png';
import music from '../../assets/music.png';
import drawing from '../../assets/drawing.png';
import team from '../../assets/team.png';
import hobbies from '../../assets/hobbies.png';
import guide from '../../assets/guide.png';
import expert from '../../assets/expert.png';
import conversation from '../../assets/conversation.png';
import books from '../../assets/books.png';
import blur from '../../assets/blur.png';
import star from '../../assets/star.png';
import diamond from '../../assets/diamond.png';
import pattern from '../../assets/pattern.png';
import Footer from '../footer/Footer';

function AboutUsPage() {
    return(
        <div className='about-us-body'>
            <Header mode="light"/>
            <div className='background-image-color'>
                <div className='about-us-main-text-container'>
                    <div className='about-us-main-text'>Our project</div>
                    <div className='our-project'>The best roadmaps, powered by the community</div>
                </div>
            </div>
            <div>
                <img src={spots} className='about-us-spots'></img>
                <img src={programming} className='about-us-programming'></img>
                <img src={points} className='about-us-points1'></img>
                <img src={points} className='about-us-points2'></img>
                <img src={reward} className='about-us-reward'></img>
                <img src={music} className='about-us-music'></img>
                <img src={drawing} className='about-us-drawing'></img>
            </div>
            <div className='about-us-images-container'>
                <img src={img1} className='image1'></img>
                <img src={img2} className='image2'></img>
                <img src={img3} className='image3'></img>
                <img src={img4} className='image4'></img>
            </div>
            <div className='about-us-subbody'>
                <div className='about-us-about-us-container'>
                    <div className='about-us-about-us-text-container'>
                        <div className='about-us-about-us-title'>About us</div>
                        <div className='about-us-about-us-text'>Welcome to NextStep — a project created by a group of passionate students as part of our bachelor’s degree journey. <br></br><br></br>We believe that finding the right path in life — whether it’s a hobby you’ve always wanted to try or a career you’re just discovering — shouldn’t feel like navigating a maze alone. That’s why we built <span style={{fontWeight: 'bold'}}>NextStep</span>: a platform where clear, structured roadmaps meet real experience.</div>
                    </div>
                    <img src={team} className='about-us-about-us-image'></img>
                </div>
                <div className='about-us-about-project-container'>
                    <img src={hobbies} className='about-us-about-project-image'></img>
                    <div className='about-us-about-project-image-space'></div>
                    <div className='about-us-about-project-text-container'>
                        <div className='about-us-about-project-title'>About Project</div>
                        <div className='about-us-about-project-text'>Here, you’ll find curated roadmaps for a wide range of interests — from photography to programming, cooking to game development — all contributed to and improved by people who’ve walked the path themselves. Our goal is to create a community-driven knowledge hub, where learners, hobbyists, and experts collaborate to make each roadmap better over time.</div>
                    </div>
                </div>
                <div className='about-us-project-gives-container'>
                    <div>
                        <img src={blur} className='blur'></img>
                        <img src={star} className='star'></img>
                        <img src={diamond} className='diamond'></img>
                        <img src={pattern} className='pattern'></img>
                    </div>
                    <div className='about-us-project-gives-title'>Whether you’re just starting out or looking to level up, NextStep gives you</div>
                    <div className='about-us-project-gives-elements-container'>
                        <div className='about-us-project-gives-element'>
                            <div className='about-us-project-gives-element-image-container'>
                                <img src={guide} className='about-us-project-gives-element-image'></img>
                                <div className='about-us-project-gives-element-image-circle'></div>
                            </div>
                            <div className='about-us-project-gives-element-text'>Clear step-by-step guides</div>
                        </div>
                        <div className='about-us-project-gives-element'>
                            <div className='about-us-project-gives-element-image-container'>
                                <img src={expert} className='about-us-project-gives-element-image'></img>
                                <div className='about-us-project-gives-element-image-circle'></div>
                            </div>
                            <div className='about-us-project-gives-element-text'>Contributions from people who’ve been there</div>
                        </div>
                        <div className='about-us-project-gives-element'>
                            <div className='about-us-project-gives-element-image-container'>
                                <img src={conversation} className='about-us-project-gives-element-image'></img>
                                <div className='about-us-project-gives-element-image-circle'></div>
                            </div>
                            <div className='about-us-project-gives-element-text'>Discussions to explore deeper questions</div>
                        </div>
                        <div className='about-us-project-gives-element'>
                            <div className='about-us-project-gives-element-image-container'>
                                <img src={books} className='about-us-project-gives-element-image'></img>
                                <div className='about-us-project-gives-element-image-circle'></div>
                            </div>
                            <div className='about-us-project-gives-element-text'>Book and resource recommendations that actually help</div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default AboutUsPage;