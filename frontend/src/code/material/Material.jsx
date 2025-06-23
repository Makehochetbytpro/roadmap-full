import { useState } from 'react';
import './Material.css';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import Advise from '../discussion/Advise.jsx';
import Comment from '../discussion/Comment.jsx'
import Recommendation from '../discussion/Recommendation.jsx';
import programmerImage from '../../assets/rear-view-programmer.jpg';
import bestResource from '../../assets/best-resource.png';
import bestAdvice from '../../assets/best-advice.png';
import bestContibutor from '../../assets/best-contributor.png';
import { motion } from "framer-motion";
import done from '../../assets/checkmark.png'

function Material() {
    const subtopics = [
        {
          id: 1,
          title: "Java syntax and Basics",
          content: (
            <div className="space-y-2">
              <ol className="list-decimal pl-5 text-sm text-left">
                <li>Variables, data types, operators</li>
                <li>OOP (Object-Oriented Programming)</li>
                <li>Collections – Lists, Sets, Maps, Queues</li>
                <li>Exception Handling – try-catch, finally, custom exceptions</li>
                <li>Generics & Annotations – Type safety, custom annotations</li>
                <li>Networking & JDBC – Sockets, HTTP, database connectivity</li>
              </ol>
              <div className="pt-2">
                <p>💡 <strong>Study hard</strong></p>
                <ul className="list-disc pl-5">
                  <li>▶️ Top 10 best java courses</li>
                  <li>▶️ Just watch</li>
                  <li>📖 Monkey learns to read</li>
                  <li>📖 GGs</li>
                </ul>
              </div>
            </div>
          ),
        },
        {
          id: 2,
          title: "web concepts: HTTP protocol and basics of HTML, JavaScript, CSS",
          content: <div className="space-y-2">
            <ol className="list-decimal pl-5 text-sm text-left">
                <li>Variables, data types, operators</li>
                <li>OOP (Object-Oriented Programming)</li>
                <li>Collections – Lists, Sets, Maps, Queues</li>
                <li>Exception Handling – try-catch, finally, custom exceptions</li>
                <li>Generics & Annotations – Type safety, custom annotations</li>
                <li>Networking & JDBC – Sockets, HTTP, database connectivity</li>
            </ol>
            <div className="pt-2">
                <p>💡 <strong>Study hard</strong></p>
                <ul className="list-disc pl-5">
                <li>▶️ Top 10 best java courses</li>
                <li>▶️ Just watch</li>
                <li>📖 Monkey learns to read</li>
                <li>📖 GGs</li>
                </ul>
            </div>
          </div>,
        },
        {
          id: 3,
          title: "Maven",
          content: null,
        },
    ];

    const [activeId, setActiveId] = useState(null);
    const toggleSection = (id) => {
        setActiveId(activeId === id ? null : id);
    };
    
    return (
        <div className='material-body'>
            <Header />
            <div className='material-header-relative'></div>
            <div className='material-without-header-body'>
                <div className='material-roadmaps-sidebar-container'>
                    <div className='material-roadmaps-sidebar'>
                        <div className='material-roadmaps-sidebar-roadmaps-container'>
                            <div className='material-roadmaps-sidebar-roadmaps-name'>Other topics</div>
                            <div className='material-roadmaps-sidebar-roadmaps-other-topics'>• Intro to Java</div>
                            <div className='material-roadmaps-sidebar-roadmaps-other-topics'>• Creating website</div>
                            <div className='material-roadmaps-sidebar-roadmaps-other-topics'>• Additional Instruments</div>
                        </div>
                    </div>
                </div>
                <div className='material-main-body'>
                    <div className="container">
                        {subtopics.map((topic) => (
                            <div
                                key={topic.id}
                                className={`section ${topic.id === 3 ? "green" : ""}`}
                                onClick={() => toggleSection(topic.id)}
                            >
                                <div className="section-header">
                                    <h2 className="section-title">{topic.title}</h2>
                                    <div className='section-icons'>
                                        <img className="other-icon" src={done}></img>
                                        <span className="toggle-icon">{activeId === topic.id ? "−" : "+"}</span>
                                    </div>
                                </div>
                                {activeId === topic.id && topic.content && (
                                    <div className="section-content">{topic.content}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}    

export default Material;
