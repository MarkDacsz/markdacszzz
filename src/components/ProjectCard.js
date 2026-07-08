import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const badgeVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function ProjectCard({ project }) {
  const [expanded, setExpanded] = useState(false);
  const previewFeatures = project.features.slice(0, 5);
  const needsToggle = project.features.length > 5;
  const statusFeature = `Project Status: ${project.status}`;

  const visibleFeatures = expanded
    ? [...project.features, statusFeature]
    : [...previewFeatures, statusFeature];

  return (
    <motion.article
      className="project-card"
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      layout
    >
      <div className="project-card__body project-card__body--no-image" layout>
        <div className="project-card__header">
          <h3>{project.title}</h3>
        </div>

        <p className="project-card__summary">{project.shortDescription}</p>

        <div className="project-card__badges">
          {project.technologies.map((tech) => (
            <motion.span
              key={tech}
              className="project-card__badge"
              variants={badgeVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {tech}
            </motion.span>
          ))}
        </div>

        <motion.div className="project-card__features" layout>
          <div className="project-card__feature-header">
            <h4>Key Features</h4>
          </div>

          <motion.ul className="feature-list" layout initial={false} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: "easeOut" }}>
            {visibleFeatures.map((feature) => (
              <motion.li
                key={feature}
                className={`feature-item ${feature === statusFeature ? "feature-item--status" : ""}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <span className="feature-dot" aria-hidden="true" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </motion.ul>

          {needsToggle && (
            <button
              type="button"
              className="project-card__toggle"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
            >
              {expanded ? (
                <>
                  See Less <FaChevronUp />
                </>
              ) : (
                <>
                  See More <FaChevronDown />
                </>
              )}
            </button>
          )}
        </motion.div>
      </div>
    </motion.article>
  );
}
