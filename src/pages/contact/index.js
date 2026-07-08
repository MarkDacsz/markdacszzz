import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import "./style.css";

const contactItems = [
  {
    id: "email",
    title: "Email",
    value: "dacsilm@gmail.com",
    href: "mailto:dacsilm@gmail.com",
    icon: <MdEmail aria-hidden="true" />,
    ariaLabel: "Send email to dacsilm@gmail.com",
    clickable: true,
  },
  {
    id: "phone",
    title: "Phone",
    value: "+63 976 510 5644",
    href: "tel:+639765105644",
    icon: <MdPhone aria-hidden="true" />,
    ariaLabel: "Call phone number",
    clickable: true,
  },
  {
    id: "github",
    title: "GitHub",
    value: "github.com/MarkDacsz",
    href: "https://github.com/MarkDacsz",
    icon: <FaGithub aria-hidden="true" />,
    ariaLabel: "Open GitHub profile",
    external: true,
    clickable: true,
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    value: "linkedin.com/in/john-chrismark-dacsil-00b7a8316",
    href: "https://www.linkedin.com/in/john-chrismark-dacsil-00b7a8316",
    icon: <FaLinkedin aria-hidden="true" />,
    ariaLabel: "Open LinkedIn profile",
    external: true,
    clickable: true,
  },
  {
    id: "location",
    title: "Location",
    value: "Philippines",
    icon: <MdLocationOn aria-hidden="true" />,
    ariaLabel: "Location Philippines",
    clickable: false,
  },
];

export const ContactUs = () => {
  return (
    <HelmetProvider>
      <Container className="About-header contact-page">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Contact | Mark Dacsz</title>
          <meta name="description" content="Contact John Chrismark Dacsil for opportunities, collaborations, or freelance work." />
        </Helmet>

        <Row className="mb-5 mt-3 pt-md-3 justify-content-center text-center">
          <Col lg="8">
            <h1 className="display-4 mb-3">Contact</h1>
            <hr className="t_border my-4 ml-0 text-left" />
            <p className="contact-intro">
              Get in touch.
              <br />
              I&apos;m always open to discussing opportunities,
              collaborations, or freelance projects.
            </p>
          </Col>
        </Row>

        <Row className="contact-grid justify-content-center">
          {contactItems.map((item, index) => {
            const card = (
              <div
                className={`contact-card ${item.clickable ? "contact-card--clickable" : "contact-card--static"}`}
                role={item.clickable ? "link" : undefined}
                tabIndex={item.clickable ? -1 : undefined}
              >
                <div className="contact-card__icon">{item.icon}</div>
                <div className="contact-card__content">
                  <h3>{item.title}</h3>
                  <p className="contact-card__value">{item.value}</p>
                </div>
              </div>
            );

            if (item.clickable) {
              return (
                <Col key={item.id} lg="4" md="6" sm="12" className="mb-4">
                  <a
                    className="contact-card-link"
                    href={item.href}
                    aria-label={item.ariaLabel}
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {card}
                  </a>
                </Col>
              );
            }

            return (
              <Col key={item.id} lg="4" md="6" sm="12" className="mb-4">
                {card}
              </Col>
            );
          })}
        </Row>
      </Container>
    </HelmetProvider>
  );
};
