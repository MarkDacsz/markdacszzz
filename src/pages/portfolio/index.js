import React, { useState } from "react";
import "./style.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { dataportfolio, datavideo, meta } from "../../content_option";

export const Portfolio = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // IMAGE
  const openImageLightbox = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageLightbox = () => {
    setSelectedImage(null);
  };


 const openVideoModal = (videoUrl) => {
  setSelectedVideo(videoUrl);
};


  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  return (
    <HelmetProvider>
      <Container className="About-header">

        <Helmet>
          <meta charSet="utf-8" />
          <title> Portfolio | {meta.title} </title>
          <meta name="description" content={meta.description} />
        </Helmet>

        {/* HEADER */}
        <Row className="mb-5 mt-3 pt-md-3">
          <Col lg="8">
            <h1 className="display-4 mb-4"> Portfolio </h1>
            <hr className="t_border my-4 ml-0 text-left" />
          </Col>
        </Row>

        {/* IMAGE SECTION */}
        <Row className="mb-5">
          <Col lg="12">
            <h2 className="mb-4">Image Projects</h2>

            <div className="mb-5 po_items_ho">
              {dataportfolio.map((data, i) => (
                <div key={i} className="po_item">
                  <img src={data.img} alt="" />

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
            <h2 className="mb-4">Video Projects</h2>
            <hr className="t_border my-4 ml-0 text-left" />
          </Col>
        </Row>

        <Row className="mb-5">
          {datavideo.map((video, i) => (
            <Col md="6" lg="4" className="mb-4" key={i}>
              <div className="po_item video_item">

                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="video_thumbnail"
                />

                <div
                  className="video_play_overlay"
                  onClick={() => openVideoModal(video.link)}
                >
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

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div className="lightbox_overlay" onClick={closeImageLightbox}>
          <div
            className="lightbox_content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="lightbox_close" onClick={closeImageLightbox}>
              &times;
            </button>

            <img
              src={selectedImage}
              alt="lightbox"
              className="lightbox_image"
            />
          </div>
        </div>
      )}

      {/* VIDEO MODAL (FIXED - GOOGLE DRIVE WORKING) */}
      {selectedVideo && (
        <div className="video_modal_overlay" onClick={closeVideoModal}>
          <div
            className="video_modal_content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="video_modal_close" onClick={closeVideoModal}>
              &times;
            </button>

          <iframe
          src={selectedVideo}
          title="Video Player"
          style={{
          width: "100%",
          height: "500px",
          border: "none"
          }}
          allow="autoplay"
          allowFullScreen
          />


          </div>
        </div>
      )}

    </HelmetProvider>
  );
};
