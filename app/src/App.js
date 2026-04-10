import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import './App.css';
import latestTag from './latestTag.txt';

// Componente de fondo de partículas
const ParticleBackground = ({ theme }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const colors = theme === 'dark'
      ? [
        'rgba(102, 51, 153, 0.6)',
        'rgba(35, 78, 160, 0.5)',
        'rgba(15, 120, 87, 0.5)',
        'rgba(207, 100, 0, 0.5)'
      ]
      : [
        'rgba(0, 150, 215, 0.4)',
        'rgba(104, 159, 56, 0.4)',
        'rgba(242, 142, 28, 0.4)',
        'rgba(41, 121, 255, 0.4)'
      ];

    let mousePosition = {
      x: null,
      y: null,
      radius: 150
    };

    window.addEventListener('mousemove', (event) => {
      mousePosition.x = event.x;
      mousePosition.y = event.y;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedFactor = Math.random() * 0.5 + 0.2;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        let dx = mousePosition.x - this.x;
        let dy = mousePosition.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) distance = 1;

        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        const maxDistance = 100;
        let force = (maxDistance - distance) / maxDistance;

        if (force < 0) force = 0;

        let directionX = (forceDirectionX * force * this.density) * -1;
        let directionY = (forceDirectionY * force * this.density) * -1;

        if (distance < mousePosition.radius) {
          this.x += directionX * this.speedFactor;
          this.y += directionY * this.speedFactor;
        } else {
          if (this.x !== this.baseX) {
            dx = this.x - this.baseX;
            this.x -= dx / 15 * this.speedFactor;
          }
          if (this.y !== this.baseY) {
            dy = this.y - this.baseY;
            this.y -= dy / 15 * this.speedFactor;
          }
        }
        this.draw();
      }
    }

    const particlesArray = [];
    const numberOfParticles = theme === 'dark' ? 70 : 80;

    const init = () => {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };

    init();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connectParticles();
      requestAnimationFrame(animate);
    };

    const connectParticles = () => {
      const connectionDistance = theme === 'dark' ? 100 : 120;
      const lineOpacity = theme === 'dark' ? 0.5 : 0.3;

      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const lineColor = theme === 'dark'
              ? `rgba(90, 90, 120, ${lineOpacity * (1 - distance / connectionDistance)})`
              : `rgba(100, 149, 237, ${lineOpacity * (1 - distance / connectionDistance)})`;

            ctx.strokeStyle = lineColor;
            ctx.lineWidth = theme === 'dark' ? 0.8 : 0.6;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', (event) => {
        mousePosition.x = event.x;
        mousePosition.y = event.y;
      });
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: theme === 'dark' ? 0.8 : 0.7
      }}
    />
  );
};

function Header({ toggleTheme, theme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const headerClass = `header ${theme}`;
  const navClass = `header-nav ${menuOpen ? 'open' : ''}`;
  const boxClass = `menu-box ${theme}`;

  return (
    <header className={headerClass}>
      <div className="container header-container">
        <div className="header-name">Rodrigo Montenegro</div>
        <nav className={navClass}>
          <ul>
            {['Inicio', 'Sobre mí', 'Proyectos', 'Contacto'].map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={toggleMenu}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button className="menu-toggle-btn" onClick={toggleMenu}>
          ☰
        </button>
      </div>
      <div className={boxClass}></div>
    </header>
  );
}

function Home() {
  const [tagContent, setTagContent] = useState('');

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const response = await fetch(latestTag);
        const text = await response.text();
        setTagContent(text);
      } catch (error) {
        console.error('Error al cargar la etiqueta:', error);
      }
    };
    fetchTag();
  }, []);

  return (
    <section id="inicio" className="section home full-height">
      <div className="container home-container">
        <div className="home-content">
          <h1 className="home-title">¡Hola! mi nombre es Rodrigo Montenegro <span className="wave-emoji">👋</span></h1>
          <h2 className="home-subtitle">Construyendo el futuro con código y automatización</h2>

          <div className="home-description">
            <p>
              Bienvenido a mi mundo tech donde <span className="tech-highlight">Docker</span>,
              <span className="tech-highlight">Kubernetes</span>,
              <span className="tech-highlight">Jenkins</span> y
              <span className="tech-highlight">Linux</span> se combinan para crear
              soluciones ágiles y escalables.
            </p>
            <p>
              Me apasiona automatizar procesos, optimizar infraestructuras y resolver
              desafíos complejos con tecnologías DevOps.
            </p>
          </div>

          <div className="home-actions">
            <a href="#proyectos" className="btn primary-btn">Ver mis proyectos <span className="btn-icon">🚀</span></a>
          </div>
        </div>
      </div>

      {tagContent && (
        <div className="version-tag">
          <p>Versión: {tagContent}</p>
        </div>
      )}
    </section>
  );
}

const experienceData = [
  {
    id: 1,
    company: "ACL (Cliente: Falabella Financiero)",
    role: "DevOps Engineer",
    period: "2025 - Presente",
    description: "Continuidad operacional del ecosistema Kubernetes multi-cloud (Azure/GCP). Resolución de incidentes productivos, troubleshooting de networking entre servicios (RabbitMQ, Redis, APIs y DBs) y ajustes de firewall (NSG/iRules). Implementación de cambios mediante Terraform y soporte a equipos de desarrollo.",
    technologies: ["Kubernetes", "Azure", "GCP", "Terraform", "Networking", "RabbitMQ", "Vault"]
  },
  {
    id: 2,
    company: "Ximple Tech (Cliente: Falabella Financiero)",
    role: "DevOps Engineer",
    period: "2025",
    description: "Administración de plataforma DevOps y servicios core: Vault, Harbor, Kong y ElasticSearch/Kibana. Configuración de conectividad entre ambientes y normalización de escalamiento de clusters.",
    technologies: ["Kubernetes", "Vault", "Kong", "ElasticSearch", "CI/CD", "Cloud"]
  },
  {
    id: 3,
    company: "Ayelen",
    role: "DevOps Infrastructure Engineer",
    period: "2023 - 2025",
    description: "Administración de servidores Linux RedHat, respaldo y recuperación de PostgreSQL/MongoDB, automatización con Bash y monitoreo con Nagios. Despliegues de APIs con Jenkins sobre Docker y Kubernetes.",
    technologies: ["Linux", "PostgreSQL", "MongoDB", "Docker", "Jenkins", "Bash", "Nagios"]
  },
  {
    id: 4,
    company: "EGT (Seidor)",
    role: "DevOps Engineer",
    period: "2022 - 2023",
    description: "Administración de plataformas con Docker y Kubernetes, monitoreo con Prometheus/Grafana y gestión de logs de APIs. Instalación y configuración de RabbitMQ y soporte operativo bajo metodología RFC.",
    technologies: ["Docker", "Kubernetes", "Prometheus", "Grafana", "RabbitMQ", "Linux"]
  },
  {
    id: 5,
    company: "Trifenix",
    role: "DevOps & CI/CD",
    period: "2021 - 2022",
    description: "Implementación de contenedores Docker y pipelines CI/CD en Azure DevOps. Integración de SonarQube y despliegue de aplicaciones en AWS usando Terraform.",
    technologies: ["Docker", "Azure DevOps", "SonarQube", "AWS", "Terraform", "CI/CD"]
  }
];

function Experience() {
  return (
    <section id="experiencia" className="section experience full-height">
      <div className="container">
        <h2 className="section-title">Experiencia Profesional</h2>
        <div className="experience-container">
          <div className="timeline">
            {experienceData.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h3>{item.role}</h3>
                    <span className="company-name">@ {item.company}</span>
                    <span className="period">{item.period}</span>
                  </div>
                  <p>{item.description}</p>
                  <div className="tech-tags">
                    {item.technologies.map((tech, i) => (
                      <span key={i} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="resume-download">
            <a href="/imagenes/Rodrigo_Montenegro_CV-3.pdf" download className="btn primary-btn">
              Descargar CV Completo <span className="btn-icon">📄</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  const skills = [
    { name: 'Contenedorización y Orquestación', icon: '🐳', description: 'Docker, Kubernetes, gestión de contenedores y clusters' },
    { name: 'CI/CD', icon: '⚙️', description: 'Jenkins, Azure DevOps, automatización de despliegues' },
    { name: 'Monitorización y Alertas', icon: '📊', description: 'Prometheus, Grafana, Nagios, sistemas de alertas proactivas' },
    { name: 'Administración de Bases de Datos', icon: '🗄️', description: 'PostgreSQL, MongoDB, optimización y gestión' },
    { name: 'Scripting y Automatización', icon: '🔧', description: 'Bash, Python, automatización de tareas repetitivas' }
  ];

  return (
    <section id="sobre-mí" className="section about full-height">
      <div className="container">
        <div className="about-container">
          <h2 className="section-title">Sobre mí</h2>

          <div className="about-content">
            <div className="about-text">
              <div className="about-card">
                <p className="about-intro">
                  <span className="highlight">Como Ingeniero DevOps</span> con amplia experiencia en administración de
                  infraestructura y automatización, he desarrollado soluciones robustas para entornos
                  Linux y Kubernetes.
                </p>
                <p>
                  Mi experiencia implementando sistemas CI/CD con Jenkins y Azure DevOps
                  me ha permitido optimizar procesos de desarrollo y despliegue, mejorando
                  significativamente la eficiencia operativa de los equipos de desarrollo.
                </p>
              </div>
            </div>

            <div className="about-image-container">
              <div className="profile-image">
                <img src="/imagenes/profile.png" alt="Rodrigo Montenegro" />
                <div className="image-overlay">
                  <span className="name-badge">Rodrigo Montenegro</span>
                </div>
              </div>
            </div>
          </div>

          <div className="skills-section">
            <h3 className="skills-title">Mis habilidades:</h3>

            <div className="skills-container">
              {skills.map((skill, index) => (
                <div key={index} className="skill-card">
                  <div className="skill-icon">{skill.icon}</div>
                  <h4>{skill.name}</h4>
                  <p>{skill.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectDetail({ project, onClose }) {
  return (
    <div className="project-detail" onClick={(e) => e.stopPropagation()}>
      <div className="project-detail-header">
        <h3>{project.title}</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="project-detail-content">
        <div className="project-image">
          <img src={project.image} alt={project.title} />
        </div>

        <div className="project-info">
          <div className="project-description" dangerouslySetInnerHTML={{ __html: project.description }}></div>

          <h4>Detalles del proyecto:</h4>
          <ul className="project-details-list">
            <li><span>Tecnologías:</span> {project.technologies}</li>
            <li><span>Duración:</span> {project.duration}</li>
            <li><span>Rol:</span> {project.role}</li>
            {project.results && <li><span>Resultados:</span> {project.results}</li>}
          </ul>


        </div>
      </div>
    </div>
  );
}

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState('todos');

  // Función unificada para cerrar el modal, ya sea haciendo clic en el overlay o en el botón de cierre.
  const handleCloseDetail = () => {
    setSelectedProject(null);
  };

  const projects = [
    {
      id: 1,
      title: 'Gestión de Infraestructura Multi-Cloud (Falabella)',
      summary: 'Gestión y optimización de un ecosistema multi-cloud complejo, enfocado en infraestructura como código, seguridad y administración de servicios core.',
      description: `
        <h5>Responsabilidades Clave:</h5>
        <ul>
          <li>Resolución de pruebas de conectividad entre clusters, bases de datos y servicios en múltiples ambientes.</li>
          <li>Revisión y merge de MR para cambios de infraestructura utilizando Terraform.</li>
          <li>Configuración de reglas de firewall (NSG, irules) para permitir conectividad entre servicios.</li>
          <li>Regularización de escalamiento de clusters Kubernetes ajustando <code>node_max_count</code>.</li>
          <li>Administración de servicios core: Vault, Harbor, Kong, RabbitMQ y ElasticSearch/Kibana.</li>
        </ul>
        <h5>Logros Específicos:</h5>
        <ul>
          <li>Implementación de Storage Accounts en Azure desde cero, incluyendo VNet y políticas de acceso.</li>
          <li>Configuración de permisos granulares en buckets de GCP con Service Accounts y roles IAM.</li>
          <li>Resolución de errores de certificados SSL/TLS (error 509) mediante redeployment de planes Terraform.</li>
        </ul>
      `,
      image: 'https://placehold.co/800x600/A374FF/FFFFFF?text=Gesti%C3%B3n+Cloud',
      technologies: 'Kubernetes, GCP, Azure, Terraform, Vault, Harbor, Kong, RabbitMQ, ElasticSearch, Jenkins',
      duration: 'Continuo',
      role: 'DevOps Engineer',
      results: 'Gestión y optimización de un ecosistema multi-cloud complejo.',
      category: 'Infraestructura',
      link: '#',
      repo_link: 'https://github.com/rodrigomontenegro/sherpa-falabella-infra'
    },
    {
      id: 2,
      title: 'Administración y Migración de Sistemas (Ayelen)',
      summary: 'Modernización de infraestructura y automatización de procesos críticos de bases de datos, incluyendo migraciones de sistemas y configuración para alta disponibilidad.',
      description: `
        <h5>Responsabilidades Clave:</h5>
        <ul>
          <li>Instalación y configuración de bases de datos (PostgreSQL, MongoDB) en servidores Red Hat.</li>
          <li>Automatización de dumps y restauraciones de bases de datos en ambientes QA y PRD.</li>
          <li>Desarrollo de pipelines en Jenkins para despliegue de APIs y servicios.</li>
          <li>Implementación de scripts en Bash para monitoreo y gestión de logs en Kubernetes.</li>
          <li>Despliegue y administración de aplicaciones en WebLogic y GlassFish.</li>
        </ul>
        <h5>Logros Específicos:</h5>
        <ul>
          <li>Investigación y configuración de PostgreSQL 15.5 para roles Master/Slave y recuperación ante desastres.</li>
          <li>Lideré la migración de jobs de un Jenkins legacy a una nueva instancia con pipelines modernos en 2024.</li>
          <li>Dirigí la migración de alertas a una nueva plataforma Nagios, incluyendo manuales de integración.</li>
        </ul>
      `,
      image: 'https://placehold.co/800x600/5DD9C1/FFFFFF?text=Bases+de+Datos',
      technologies: 'MongoDB, PostgreSQL, Docker, Jenkins, Nagios, Bash, Kubernetes, Nginx, WebLogic, Terraform, AWS',
      duration: '2 años',
      role: 'DevOps Infrastructure Engineer',
      results: 'Modernización de infraestructura y automatización de procesos críticos de BD.',
      category: 'Bases de Datos',
      link: '#',
      repo_link: 'https://github.com/rodrigomontenegro/ayelen-system-migration'
    },
    {
      id: 3,
      title: 'CI/CD y Contenerización (Proyecto AGRO)',
      summary: 'Establecimiento de un flujo de CI/CD completo desde Azure DevOps hacia AWS, utilizando Docker, Terraform y SonarQube para análisis de calidad de código.',
      description: `
        <h5>Responsabilidades Clave:</h5>
        <ul>
          <li>Investigación y documentación de la implementación de Docker en Azure.</li>
          <li>Implementación de contenedores de la página web localmente utilizando Docker.</li>
          <li>Configuración de SonarQube para la verificación automática de calidad de código.</li>
          <li>Integración y distribución continua (CI/CD) desde Azure DevOps.</li>
          <li>Despliegue de la página web en AWS y configuración de CI/CD desde Azure DevOps.</li>
        </ul>
      `,
      image: 'https://placehold.co/800x600/FFC107/FFFFFF?text=CI/CD',
      technologies: 'Docker, SonarQube, AWS, Terraform, Azure DevOps, Azure Board',
      duration: 'N/A',
      role: 'DevOps & CI/CD',
      results: 'Establecimiento de un flujo de CI/CD completo con análisis de calidad de código.',
      category: 'DevOps',
      link: '#',
      repo_link: 'https://github.com/rodrigomontenegro/agro-project-cicd'
    },
    {
      id: 4,
      title: 'Plataforma de Monitoreo (PSD)',
      summary: 'Creación de una solución de monitoreo integral con Prometheus, Grafana y ELK para la visualización de métricas de servidor y estado de aplicaciones.',
      description: `
        <h5>Responsabilidades Clave:</h5>
        <ul>
          <li>Resolución de problemas relacionados con la plataforma y bases de datos en Oracle y Postgres.</li>
          <li>Desarrollo de software para la visualización de métricas del servidor.</li>
          <li>Implementación del stack de monitoreo: Prometheus, Alertmanager, y Blackbox.</li>
          <li>Creación de dashboards en Grafana para visualización de datos.</li>
          <li>Documentación de tecnologías y procesos en Confluence.</li>
        </ul>
      `,
      image: 'https://placehold.co/800x600/FF6B6B/FFFFFF?text=Monitoreo',
      technologies: 'Oracle, Postgres, Spring Boot, Prometheus, Alertmanager, Blackbox, Grafana, Jira',
      duration: 'N/A',
      role: 'DevOps Engineer',
      results: 'Creación de una solución de monitoreo integral para la visualización de métricas de servidor.',
      category: 'Monitoreo',
      link: '#',
      repo_link: 'https://github.com/rodrigomontenegro/psd-monitoring-stack'
    },
    {
      id: 5,
      title: 'Portafolio Personal Interactivo',
      summary: 'Creación de esta misma página web como una Single Page Application (SPA) utilizando React, enfocada en la componentización y la interactividad.',
      description: `
        <h5>Desarrollo y Características:</h5>
        <ul>
          <li>Desarrollo de una Single Page Application (SPA) con <strong>React</strong> para una experiencia de usuario fluida y sin recargas.</li>
          <li>Implementación de componentes reutilizables, como las tarjetas de proyecto y el detalle modal.</li>
          <li>Uso de <strong>React Hooks</strong> (<code>useState</code>) para gestionar el estado de la aplicación, como el filtrado de proyectos y la visualización del modal.</li>
          <li>Renderizado dinámico de contenido a partir de un array de objetos, facilitando la adición de nuevos proyectos.</li>
          <li>Maquetación con HTML5 y CSS, buscando un diseño limpio y responsive.</li>
          <li>Configuración de un pipeline de <strong>CI/CD con Azure DevOps</strong> para la integración y el versionamiento.</li>
          <li>Aplicación de <strong>versionamiento semántico</strong> para la gestión de releases.</li>
          <li>Despliegue continuo en <strong>Netlify</strong>, integrado con el repositorio de GitHub.</li>
        </ul>
      `,
      image: 'https://placehold.co/800x600/4D96FF/FFFFFF?text=Portafolio+React',
      technologies: 'React, JavaScript (ES6+), JSX, HTML5, CSS, Azure DevOps, Netlify',
      duration: 'N/A',
      role: 'Desarrollador Frontend',
      results: 'Portafolio interactivo y desplegado.',
      category: 'Desarrollo Web',
      link: '#',
      repo_link: 'https://github.com/rodrigomontenegro/portafolio_1'
    }
  ];

  const categories = ['todos', ...new Set(projects.map(project => project.category))];

  const filteredProjects = filter === 'todos'
    ? projects
    : projects.filter(project => project.category === filter);

  return (
    <section id="proyectos" className="section projects full-height">
      <div className="container">
        <h2 className="section-title">Proyectos</h2>
        <p className="section-subtitle">
          Estos proyectos demuestran mi experiencia en infraestructura, automatización y desarrollo de soluciones DevOps.
        </p>

        <div className="filter-container">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${filter === category ? 'active' : ''}`}
              onClick={() => setFilter(category)}
            >
              {category === 'todos' ? 'Todos' : category}
            </button>
          ))}
        </div>

        <div className="projects-grid">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => setSelectedProject(project)}
            >
              <div className="project-image-container">
                <img src={project.image} alt={project.title} />
                <div className="project-overlay">
                  <span className="view-details">Ver detalles</span>
                </div>
              </div>
              <div className="project-content">
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <div className="tech-tags">
                  {project.technologies.split(', ').slice(0, 3).map((tech, i) => (
                    <span key={i} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedProject && (
          <div className="modal" onClick={handleCloseDetail}>
            <div className="modal-content">
              <ProjectDetail project={selectedProject} onClose={handleCloseDetail} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Componente de contacto modernizado
function Contact() {
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Enviando...');

    // --- INICIO DE LÍNEA DE DEPURACIÓN ---
    console.log('Public Key leída desde env:', process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
    // --- FIN DE LÍNEA DE DEPURACIÓN ---

    try {
      const result = await emailjs.sendForm(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        e.target,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );

      console.log('Resultado:', result);
      setStatus('¡Mensaje enviado correctamente!');
      e.target.reset(); // Resetea el formulario
      setFormData({ from_name: '', from_email: '', message: '' }); // Limpia el estado por si acaso
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      setStatus('Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contacto" className="section contact full-height">
      <div className="container">
        <div className="contact-container">
          <h2 className="section-title">Conectemos 🚀</h2>

          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-card">
                <h3 className="contact-subtitle">💬 ¡Hablemos de tu proyecto!</h3>
                <p className="contact-text">
                  ¿Necesitas optimizar tu infraestructura? ¿Implementar CI/CD?
                  ¿Mejorar la estabilidad de tus sistemas?
                </p>
                <p className="contact-text">
                  Con experiencia en <span className="highlight">DevOps, Kubernetes, Docker y Cloud</span>,
                  puedo ayudarte a transformar tus procesos y llevar tu
                  infraestructura al siguiente nivel.
                </p>

                <div className="contact-methods">
                  <div className="contact-method">
                    <div className="contact-icon">📧</div>
                    <div>
                      <div className="contact-label">Email</div>
                      <div className="contact-value">rodrigo@montecno.dev</div>
                    </div>
                  </div>
                  <div className="contact-method">
                    <div className="contact-icon">📱</div>
                    <div>
                      <div className="contact-label">Teléfono</div>
                      <div className="contact-value">+56 9 1234 5678</div>
                    </div>
                  </div>
                  <div className="contact-method">
                    <div className="contact-icon">💼</div>
                    <div>
                      <div className="contact-label">LinkedIn</div>
                      <div className="contact-value">linkedin.com/in/rodrigo-montenegro</div>
                    </div>
                  </div>
                  <div className="contact-method">
                    <div className="contact-icon">🐙</div>
                    <div>
                      <div className="contact-label">GitHub</div>
                      <div className="contact-value">github.com/rodrigomontenegro</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <div className="form-card">
                <h3 className="form-title">Envíame un mensaje</h3>
                <form onSubmit={handleSubmit} className="contact-form">
                  <InputField
                    label="Nombre"
                    name="from_name"
                    value={formData.from_name}
                    handleChange={handleChange}
                  />
                  <InputField
                    label="Correo electrónico"
                    name="from_email"
                    value={formData.from_email}
                    handleChange={handleChange}
                  />
                  <TextAreaField
                    label="Mensaje"
                    name="message"
                    value={formData.message}
                    handleChange={handleChange}
                  />
                  <button
                    type="submit"
                    className={`btn submit-btn ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Enviar mensaje'}
                  </button>

                  {status && (
                    <div className={`form-status ${status.includes('Error') ? 'error' : 'success'}`}>
                      {status}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InputField({ label, name, value, handleChange }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}:</label>
      <input
        type={name === 'from_email' || name === 'reply_to' ? 'email' : 'text'}
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={`Ingresa tu ${label.toLowerCase()}`}
        required
      />
    </div>
  );
}

function TextAreaField({ label, name, value, handleChange }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}:</label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={`Escribe tu ${label.toLowerCase()}`}
        rows="5"
        required
      />
    </div>
  );
}

function Footer({ theme }) {
  const footerClass = `footer ${theme}`;
  return (
    <footer className={footerClass}>
      <div className="container footer-container">
        <p> &copy; {new Date().getFullYear()} Rodrigo Montenegro. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <div className={`app ${theme}`}>
      <ParticleBackground theme={theme} />
      <div className="content-wrapper" style={{ position: 'relative', zIndex: 1 }}>
        <Header toggleTheme={toggleTheme} theme={theme} />
        <Home />
        <About />
        <Experience />
        <Projects />
        <Contact />
        <Footer theme={theme} />
      </div>
    </div>
  );
}

export default App;