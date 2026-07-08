import React from "react";
import { motion } from "framer-motion";
import { FaPlay } from "react-icons/fa";

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export default function VideoProjectCard({ video, onOpen }) {
  return (
    <motion.article
      className="video-card"
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={() => onOpen(video.link)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(video.link);
        }
      }}
    >
      <div className="video-card__image-wrapper">
        <motion.img
          className="video-card__image"
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
        <div className="video-card__overlay">
          <span className="video-card__play-icon">
            <FaPlay />
          </span>
        </div>
      </div>

      <div className="video-card__body">
        <div className="video-card__meta">
          <span>{video.category}</span>
          <span>{video.duration}</span>
        </div>
        <h3>{video.title}</h3>
        <p>{video.description}</p>
        <div className="video-card__footer">
          <span>{video.software}</span>
        </div>
      </div>
    </motion.article>
  );
}
