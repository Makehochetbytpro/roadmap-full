import React from 'react';
import './FeaturesSection.css';

const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      title: 'Curated Roadmaps',
      description: 'Explore expertly crafted learning paths tailored to your interests.',
    },
    {
      id: 2,
      title: 'Community Voting',
      description: 'Vote on roadmap updates to keep content relevant and engaging.',
    },
    {
      id: 3,
      title: 'Interactive Learning',
      description: 'Engage with a supportive community through feedback and discussions.',
    },
  ];

  return (
    <section className="features-section">
      <h2>Why Choose Our Platform?</h2>
      <div className="features-container">
        <div className="features-tree">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`feature-node feature-node-${index + 1}`}
            >
              <div className="node-circle"></div>
              <div className="node-text">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;