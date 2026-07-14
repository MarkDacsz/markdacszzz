import React, { useEffect, useMemo, useState } from "react";
import "./style.css";
import "./portfolio.css";
import "./modal.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { dataportfolio, datavideo, meta } from "../../content_option";
import { featuredProjects } from "../../data/portfolioData";
import ProjectCard from "../../components/ProjectCard";

function toYoutubeEmbedUrl(url) {
  if (!url) return url;

  // Already embed
  if (url.includes("youtube.com/embed/")) {
    const [base, query] = url.split("?");
    const params = new URLSearchParams(query || "");
    // Hide potential extra UI variations; keep only one controls set
    params.set("rel", "0");
    params.set("modestbranding", "1");
    params.set("iv_load_policy", "3");
    params.set("playsinline", "1");
    params.set("autoplay", "1");
    return `${base}?${params.toString()}`;
  }

  // youtu.be/<id>
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortMatch?.[1]) {
    const id = shortMatch[1];
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&autoplay=1`;
  }

  // youtube.com/watch?v=<id>
  const match = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (match?.[1]) {
    const id = match[1];
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&autoplay=1`;
  }

  // Keep as-is for non-YouTube providers
  return url;
}

export const Portfolio = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const openImageLightbox = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageLightbox = () => {
    setSelectedImage(null);
  };

  const openVideoModal = (videoUrl) => {
    setSelectedVideo(toYoutubeEmbedUrl(videoUrl));
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const isImageOpen = !!selectedImage;
  const isVideoOpen = !!selectedVideo;

  const imageAria = useMemo(() => {
    if (!selectedImage) return "";
    return "Project image preview";
  }, [selectedImage]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        closeImageLightbox();
        closeVideoModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <HelmetProvider>
      <Container className="About-header">

        {/* HEADER */}
        <Row className="mb-5 mt-3 pt-md-3">
          <Col lg="8">
            <h1 className="display-4 mb-4"> Portfolio </h1>
            <hr className="t_border my-4 ml-0 text-left" />
             <p className="portfolio-section__subtitle">
              Selected technical projects with professional summaries, 
              technology stacks, and key contributions.
            </p>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col lg="12">
            <h2 className="portfolio-section__title">Programming Projects</h2>
            <p className="portfolio-section__subtitle">
              Senior technical projects with concise descriptions, technology stacks, and key contributions.
            </p>
            <div className="project-grid">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </Col>
        </Row>

        {/* IMAGE SECTION */}
        <Row className="mb-5">
          <Col lg="12">
            <h2 className="portfolio-section__title">Image Projects</h2>
            <div className="mb-5 po_items_ho">
              {dataportfolio.map((data, i) => (
                <div key={i} className="po_item">
                  <img src={data.img} alt={data.description} loading="lazy" decoding="async" />

                  <div className="content">
                    <p>{data.description}</p>

                    <a
                      href="#!"
                      onClick={(e) => {
                        e.preventDefault();
                        openImageLightbox(data.link);
                      }}
                    >
                      view project
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>

        {/* VIDEO SECTION */}
        <Row className="mb-5">
          <Col lg="8">
            <h2 className="portfolio-section__title">Video Projects</h2>
            <p className="portfolio-section__subtitle">
              Interactive video showcases with preview cards, smooth hover interactions, and a polished modal experience.
            </p>
          </Col>
        </Row>

        <Row className="mb-5">
          {datavideo.map((video, i) => (
            <Col md="6" lg="4" className="mb-4" key={i}>
              <div className="po_item video_item" onClick={() => openVideoModal(video.link)}>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="video_thumbnail"
                  loading="lazy"
                  decoding="async"
                />

                <div className="video_play_overlay">
                  <div className="video_placeholder">
                    <i className="fa fa-play-circle"></i>
                  </div>
                </div>

                <div className="content">
                  <h5>{video.title}</h5>
                  <a
                    href="#!"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openVideoModal(video.link);
                    }}
                  >
                    play video
                  </a>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* IMAGE LIGHTBOX */}
      {selectedImage && (
        <div
          className="lightbox_overlay portfolio-image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={imageAria}
          onClick={closeImageLightbox}
        >
          <div
            className="lightbox_content portfolio-image-lightbox__content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lightbox_close"
              type="button"
              aria-label="Close image"
              onClick={closeImageLightbox}
            >
              &times;
            </button>

            <img
              className="lightbox_image portfolio-image-lightbox__image"
              src={selectedImage}
              alt="Project"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      )}

      {/* VIDEO MODAL */}
      {selectedVideo && (
        <div
          className="video_modal_overlay video_modal_overlay--open"
          onClick={closeVideoModal}
        >
          <div
            className="video_modal_content video_modal_content--open"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="video_modal_close"
              type="button"
              onClick={closeVideoModal}
              aria-label="Close video"
            >
              &times;
            </button>

            <iframe
              src={selectedVideo}
              title="Video Player"
              className="video_iframe"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}

    </HelmetProvider>
  );
};
