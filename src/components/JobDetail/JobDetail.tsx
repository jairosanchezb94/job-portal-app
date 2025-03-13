import React, { useState } from 'react';
import './JobDetail.scss';

interface JobDetailProps {
  title: string;
  company: string;
  salary: string;
  cardColor: string;
  tags: string[];
  description: string;
  created: string;
  redirect_url: string;
  source?: string;
}

const JobDetail: React.FC<JobDetailProps> = ({
  title,
  company,
  salary,
  cardColor,
  tags,
  description,
  created,
  redirect_url,
  source
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Formatear la fecha de creación
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha no disponible';
      }
      
      // Calcular la diferencia en días
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Hoy';
      } else if (diffDays === 1) {
        return 'Ayer';
      } else if (diffDays < 7) {
        return `Hace ${diffDays} días`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
      } else {
        return date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  };

  // Limitar la descripción para la vista previa
  const truncateDescription = (text: string, maxLength = 150) => {
    // Eliminar etiquetas HTML si las hay
    const strippedText = text.replace(/<[^>]*>/g, '');
    
    if (strippedText.length <= maxLength) return strippedText;
    return strippedText.substring(0, maxLength) + '...';
  };

  return (
    <div className="job-card" style={{ backgroundColor: cardColor }}>
      <div className="job-header">
        <h3 className="job-title">{title}</h3>
        <div className="job-company">{company}</div>
        
        {source && (
          <div className="job-source">
            Fuente: {source}
          </div>
        )}
      </div>
      
      <div className="job-salary">{salary}</div>
      
      <div className="job-tags">
        {tags.map((tag, index) => (
          <span key={index} className="job-tag">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="job-timestamp">
        {formatDate(created)}
      </div>
      
      <div className="job-description">
        {expanded ? (
          <div dangerouslySetInnerHTML={{ __html: description }} />
        ) : (
          <p>{truncateDescription(description)}</p>
        )}
        
        <button 
          className="toggle-description"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      </div>
      
      <div className="job-actions">
        <a 
          href={redirect_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="apply-button"
        >
          Ver oferta
        </a>
      </div>
    </div>
  );
};

export default JobDetail;