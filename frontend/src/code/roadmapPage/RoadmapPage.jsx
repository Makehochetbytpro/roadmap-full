import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './RoadmapPage.css';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import Advise from '../discussion/Advise.jsx';
import Comment from '../discussion/Comment.jsx';
import UserSuggestions from '../discussion/Recommendation.jsx';
import programmerImage from '../../assets/RoadmapPage/programming-page-image.png';
import bestResource from '../../assets/RoadmapPage/best-material.png';
import bestAdvice from '../../assets/RoadmapPage/best-advice.png';
import Tree from './Tree.jsx';

function RoadmapPage() {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState("comments");
    const [selectedNode, setSelectedNode] = useState(null);

    const [editMode, setEditMode] = useState(false);
    const [editRequest, setEditRequest] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    const handleToggleEditMode = () => {
        setEditMode(prev => !prev);
        setEditRequest(null);
    };

    const handleEditActionFromTree = (request) => {
        if (['add', 'change', 'remove'].includes(request.action)) {
            setEditRequest(request);
        }
    };

    const handleSuggestionSubmit = (suggestion) => {
        setSuggestions(prev => [...prev, { ...suggestion, votes: 0 }]);
        setEditRequest(null);
        setEditMode(false);
    };

    const handleVote = (index, type) => {
        setSuggestions(prev => {
            const newSuggestions = [...prev];
            const suggestion = newSuggestions[index];
            if (type === 'up') {
                suggestion.votes = (suggestion.votes || 0) + 1;
            } else if (type === 'down') {
                suggestion.votes = (suggestion.votes || 0) - 1;
            }
            return newSuggestions;
        });
    };

    const location = useLocation();
    const { topic, category_name = "Programming" } = location.state || {};

    const topicData = {
        name: topic.name,
        description: topic.description
    };

    class Step {
        constructor(id, name) {
            this.id = id;
            this.name = name;
        }
    }

    const bestContributor = {
        name: "Grigory",
        reputation: 35,
        advises: 5,
        recommendations: 3
    };

    const category = ["Programming", "Music & Performance", "Languages", "Neon Glow"];
    const currentCategory = category_name.toLowerCase().replace(/[^a-z]/g, "");

    const [openCard, setOpenCard] = useState(null);
    const [closingCard, setClosingCard] = useState(null);
    const handleToggle = (type) => {
        if (openCard === type) {
            setClosingCard(type);
            setOpenCard(null);
            setTimeout(() => {
                setClosingCard(null);
            }, 1000);
        } else {
            setOpenCard(type);
        }
    };

    const [roadmapBE, setRoadmapBE] = useState();
    useEffect(() => {
        fetch(`http://127.0.0.1:8000/roadmap_tree/${topic.topic_id}`)
            .then((response) => response.json())
            .then((roadmapBE) => {
                console.log(roadmapBE);
                setRoadmapBE(roadmapBE);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    const treeData = roadmapBE;

    const handleNodeSelect = (node) => {
        if (selectedNode && selectedNode.id === node.id) {
          setSelectedNode(null);
        } else {
          setSelectedNode(node);
        }
      };

    const handleClosePanel = () => {
        setSelectedNode(null);
    };

    return (
        <div className={`roadmap-body ${currentCategory}`}>
            <Header mode="programming"/>
            <img src={programmerImage} className='background-image' alt="Background" />
            <div className='subtopic-container'>
                <div className='subtopic-text'>
                    <div className='subtopic-name'>{topicData.name}</div>
                    <div className='subtopic-description'>{topicData.description}</div>
                    <div className='subtopic-feedback'></div>
                </div>
            </div>
            <div className='container-in-roadmap'>
                <div className="best-container">
                    <div className="best-resource" onClick={() => handleToggle("resource")}> 
                        <div className={`best-resource-upper-container ${openCard === "resource" || closingCard === "resource" ? "active-z" : ""} ${currentCategory}`}>
                            <div className="best-title">Best Material</div>
                        </div>
                        <div className={`best-resource-down-container ${openCard === "resource" || closingCard === "resource" ? "active-z" : ""} ${currentCategory}`}>
                            <div className='best-resource-resource-container'>
                                <img src={bestResource} className="best-image" alt="Best Material for Java" />
                            </div>
                            <div className='best-resource-resource-type'>Book</div>
                            <div className='best-resource-resource-name'>"Head First Java"</div>
                            <div className='best-resource-resource-author'>Author: Bert Bates and Kathy Sierra</div>
                            <div className='best-resource-underline'></div>
                            <div className='best-resource-source'>Source: <a href="https://www.rcsdk12.org/cms/lib/NY01001156/Centricity/Domain/4951/Head_First_Java_Second_Edition.pdf">book</a></div>
                            <div className='best-resource-source'>Likes: 312</div>
                        </div>
                        <div className={`slide-panel slide-right ${openCard === "resource" ? "open" : ""}`}>
                            <div className="slide-panel-content">
                                Explore more top-rated resources to deepen your Java knowledge, including tutorials, videos, and documentation.
                            </div>
                        </div>
                    </div>

                    <div className="best-contributor" onClick={() => handleToggle("contributor")}> 
                        <div className={`best-contributor-upper-container ${openCard === "contributor" || closingCard === "contributor" ? "active-z" : ""} ${currentCategory}`}>
                            <div className="best-title">Best Contributor</div>
                        </div>
                        <div className={`best-contributor-down-container ${openCard === "contributor" || closingCard === "contributor" ? "active-z" : ""} ${currentCategory}`}>
                            <div className="best-contributor-profile-picture-container">
                                <div className="best-contributor-profile-picture"></div>
                            </div>
                            <div className="best-contributor-username">John Doe</div>
                            <div className="best-contributor-filtered-score">Reputation: 9000</div>
                            <div className="best-contributor-underline"></div>
                            <div className='best-contributor-other-scores'>
                                <div className='best-contributor-other-score_1'>
                                    <div className='best-contributor-other-score_text'>Advises</div>
                                    <div className='best-contributor-other-score_number'>25</div>
                                </div>
                                <div className='best-contributor-other-score_2'>
                                    <div className='best-contributor-other-score_text'>Recommendations</div>
                                    <div className='best-contributor-other-score_number'>6</div>
                                </div>
                            </div>
                        </div>
                        <div className={`slide-panel slide-both ${openCard === "contributor" ? "open" : ""}`}>
                            <div className="slide-panel-content">
                                Learn more about this contributor’s journey, contributions, and tips for success in Java programming.
                            </div>
                        </div>
                    </div>

                    <div className="best-advice" onClick={() => handleToggle("advice")}> 
                        <div className={`best-advice-upper-container ${openCard === "advice" || closingCard === "advice" ? "active-z" : ""} ${currentCategory}`}>
                            <div className="best-title">Best Advice</div>
                        </div>
                        <div className={`best-advice-down-container ${openCard === "advice" || closingCard === "advice" ? "active-z" : ""} ${currentCategory}`}>
                            <div className='best-advice-advice-container'>
                                <img src={bestAdvice} className="best-image" alt="Best Advice for Java" />
                            </div>
                            <div className='best-advice-advice-text'>"Focus on understanding the fundamentals deeply"</div>
                            <div className='best-advice-advice-author'>Grigory</div>
                            <div className='best-advice-advice-likes'>53 likes</div>
                            <div className='best-advice-underline'></div>
                        </div>
                        <div className={`slide-panel slide-left ${openCard === "advice" ? "open" : ""}`}>
                            <div className="slide-panel-content">
                                Discover additional insights and advice from the community to enhance your learning experience.
                            </div>
                        </div>
                    </div>
                </div>
                <div className='roadmap-container-roadmap'>
                    <div className='roadmap-info'>
                        <div className="circle-info-yellow"></div>
                        <div className='text-info'>Necessary to learn</div>
                        <div className="circle-info-red"></div>
                        <div className='text-info'>Good to know</div>
                    </div>
                    <div className='roadmap-algoritm'>
                        <Tree 
                            data={treeData} 
                            editMode={editMode} 
                            onEditRequest={handleEditActionFromTree} 
                            onNodeSelect={handleNodeSelect}
                        />
                    </div>
                </div>
                <div className='discussion-container'>
                    <div className="container12">
                        <Panel name="recommendations" selectedTab={selectedTab} setSelectedTab={setSelectedTab}>
                            <UserSuggestions 
                                editRequest={editRequest} 
                                onSubmitSuggestion={handleSuggestionSubmit}
                                onStartEdit={handleToggleEditMode}
                                suggestions={suggestions}
                                handleVote={handleVote}
                                isActive={selectedTab === 'recommendations'}
                            />
                        </Panel>
                        <Panel name="comments" selectedTab={selectedTab} setSelectedTab={setSelectedTab}>
                            <Comment theme="dark" />
                        </Panel>
                        <Panel name="advises" selectedTab={selectedTab} setSelectedTab={setSelectedTab}>
                            <Advise theme="dark" />
                        </Panel>
                    </div>
                </div>
            </div>
            <div className={`node-panel ${selectedNode ? 'open' : ''}`}>
                {selectedNode && (
                    <div className="panel-content">
                        <button onClick={handleClosePanel} className="close-button">Close</button>
                        <h2>{selectedNode.value}</h2>
                        {selectedNode.materials.map((material, index) => (
                            <div key={index}>
                                <h3>Material {index + 1}</h3>
                                <p>{material.description}</p>
                                {material.books && material.books.length > 0 && (
                                    <ul>
                                        {material.books.map((book, idx) => (
                                            <li key={idx}><a href={book} target="_blank" rel="noopener noreferrer">Book {idx + 1}</a></li>
                                        ))}
                                    </ul>
                                )}
                                {material.videos && material.videos.length > 0 && (
                                    <ul>
                                        {material.videos.map((video, idx) => (
                                            <li key={idx}><a href={video} target="_blank" rel="noopener noreferrer">Video {idx + 1}</a></li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer mode="programming"/>
        </div>
    );
}

function Panel({ name, selectedTab, setSelectedTab, children }) {
    const isOpen = selectedTab === name;

    return (
        <div
            className={`panel ${isOpen ? "open" : "closed"}`}
            onClick={() => setSelectedTab(name)}
        >
            {!isOpen && (
                <div className="rotated-text1">{name.toUpperCase()}</div>
            )}
            {isOpen && (
                <div className={`panel-content-container ${name}`}>
                    <div className='panel-content'>
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoadmapPage;