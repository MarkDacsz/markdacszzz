import img2 from "../assets/images/Artboard 4.png";
import img3 from "../assets/images/Artboard 5.png";
import img4 from "../assets/images/birthday.png";

export const featuredProjects = [
  {
    id: "emedcore",
    title: "Emedcore+ (OpenEMR)",
    status: "Private Project",
    banner: img2,
    shortDescription:
      "Enterprise healthcare management system built on OpenEMR for patient records, scheduling, billing, and clinical workflows.",
    description:
      "Built a secure healthcare management platform on OpenEMR to support electronic medical records, patient administration, appointment scheduling, billing, and reporting workflows across clinical and financial teams.",
    technologies: ["PHP", "jQuery", "Bootstrap", "MySQL"],
    features: [
      "Secure electronic medical records for patient data and clinical history.",
      "Practice management tools for appointment scheduling and front-desk operations.",
      "Patient demographics management with configurable data fields.",
      "Billing and insurance processing for claims, invoices, and payments.",
      "Prescription management workflows for medications and refills.",
      "Patient portal support for secure communication and document access.",
      "Operational, clinical, and financial reporting dashboards for stakeholders.",
    ],
  },
  {
    id: "maxicare",
    title: "Maxicare Queue Board",
    status: "Private Project",
    banner: 0,
    shortDescription:
      "Queue management system designed for healthcare facilities to optimize patient flow and reduce waiting times.",
    description:
      "Developed a queue management system for patient intake and care pathways, enabling real-time monitoring and multi-counter coordination to improve service efficiency.",
    technologies: ["C#", "PHP", "MySQL", "JavaScript", "Maxicare API"],
    features: [
      "Automated queue number generation with configurable counter logic.",
      "Live queue dashboard for patients and staff with current status updates.",
      "Multi-counter management for parallel service stations.",
      "Department-based queue routing for specialty clinics and service lines.",
      "Real-time administration tools for queue overrides and announcements.",
      "Reporting on wait times, throughput, and service utilization.",
    ],
  },
  {
    id: "metro-dental",
    title: "Huawei AI Camera — MetroDental",
    status: "Private Project",
    banner: img4,
    shortDescription:
      "AI-powered facial recognition system for patient check-in, record retrieval, and identity matching in dental clinics.",
    description:
      "Designed an intelligent patient identification system using Huawei AI camera technology to accelerate check-in workflows and improve accuracy in patient record retrieval.",
    technologies: ["React.js", "TypeScript", "Node.js", "MySQL", "REST API"],
    features: [
      "Facial recognition registration for patients and staff.",
      "Automatic patient detection with real-time camera monitoring.",
      "Identity matching to link faces to patient profiles.",
      "Alerts for unregistered faces and access control exceptions.",
      "Visit access logs for audit and compliance tracking.",
      "Integration with existing patient record databases for seamless lookup.",
    ],
  },
];

export const videoProjects = [
  {
    id: "appdev",
    title: "App Development",
    category: "Product Demo",
    software: "Figma, Premiere Pro",
    duration: "2:30",
    thumbnail: img2,
    description:
      "Demonstrates a production-ready mobile application workflow with UI validation, feature walkthrough, and interaction highlights.",
    link: "https://drive.google.com/file/d/10y1C9f0K6PuI3vNfqUvPEI6GqMCvMqXI/preview",
  },
  {
    id: "benny-vids",
    title: "Benny Videos",
    category: "Brand Story",
    software: "Premiere Pro",
    duration: "1:52",
    thumbnail: img3,
    description:
      "A polished brand video highlighting creative direction, visual storytelling, and motion editing techniques.",
    link: "https://drive.google.com/file/d/1ZwZcb4WZ7klNTXYGlrMSy5ubLdjodDEE/preview",
  },
  {
    id: "coach-ellen",
    title: "Coach Ellen Trail Story",
    category: "Case Study",
    software: "Premiere Pro, After Effects",
    duration: "3:14",
    thumbnail: img4,
    description:
      "A documentary-style video that presents a narrative framework for athlete experience and campaign impact.",
    link: "https://drive.google.com/file/d/19LK6F2lfVv_WVMloAGjmZp4hQhPX9Uby/preview",
  },
];
