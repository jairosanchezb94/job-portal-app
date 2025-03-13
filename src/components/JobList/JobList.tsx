import React, { useEffect, useState } from 'react';
import { Job, FilterValues } from '../../models/interfaces';
import JobDetail from '../JobDetail/JobDetail';
import { fetchAllJobs } from '../../services/jobService';
import './JobList.scss';

interface JobListProps {
  filterValues: FilterValues;
  onJobsFetched?: (jobs: Job[]) => void;
}

const getCardColor = (type: Job['type']): string => {
  switch (type) {
    case 'remoto':
      return '#ffffff';
    case 'hibrido':
      return '#f0f8ff';
    case 'presencial':
      return '#e8f5e9';
    default:
      return '#ffffff';
  }
};

const JobList: React.FC<JobListProps> = ({ filterValues, onJobsFetched }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 8;

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const allJobs = await fetchAllJobs();
      setJobs(allJobs);
      
      if (onJobsFetched) {
        onJobsFetched(allJobs);
      }
      
      setCurrentPage(1);
    } catch (error) {
      console.error('Error al cargar empleos:', error);
      setError('No se pudieron cargar las ofertas de empleo. Por favor, inténtelo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Reset de la página actual cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filterValues]);

  if (loading) {
    return (
      <div className="job-list-loading">
        <div className="loading-spinner"></div>
        <p>Cargando ofertas de empleo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-list-error">
        <p>{error}</p>
        <button onClick={fetchJobs}>Reintentar</button>
      </div>
    );
  }

  // Aplicar filtros a los trabajos
  const filteredJobs = jobs.filter((job) => {
    // Filtro por texto de búsqueda
    if (filterValues.search) {
      const searchLower = filterValues.search.toLowerCase();
      const combinedText = `${job.title} ${job.company} ${job.description}`.toLowerCase();
      if (!combinedText.includes(searchLower)) return false;
    }
    
    // Filtro por tipo de trabajo
    if (filterValues.type && job.type !== filterValues.type) {
      return false;
    }
    
    // Filtro por país
    if (filterValues.country) {
      const jobCountry = job.location.country.toLowerCase();
      const filterCountry = filterValues.country.toLowerCase();
      if (!jobCountry.includes(filterCountry) && !filterCountry.includes(jobCountry)) {
        return false;
      }
    }
    
    // Filtro por salario mínimo
    if (filterValues.minSalary > 0) {
      const match = job.salary.match(/(\d+(\.\d+)?)/);
      if (match) {
        const salaryValue = parseFloat(match[1]);
        if (salaryValue < filterValues.minSalary) return false;
      } else {
        return false;
      }
    }
    
    // Filtro por tipo de contrato
    if (filterValues.contractType) {
      const text = job.description.toLowerCase() + job.title.toLowerCase();
      if (filterValues.contractType === "fulltime") {
        if (!(text.includes("full time") || text.includes("tiempo completo") || 
              text.includes("jornada completa") || text.includes("full-time"))) {
          return false;
        }
      } else if (filterValues.contractType === "parttime") {
        if (!(text.includes("part time") || text.includes("medio tiempo") || 
              text.includes("media jornada") || text.includes("part-time"))) {
          return false;
        }
      }
    }
    
    // Filtro por antigüedad máxima
    if (filterValues.maxDays > 0) {
      try {
        const jobDate = new Date(job.created);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - jobDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > filterValues.maxDays) return false;
      } catch (e) {
        // Si hay un error al parsear la fecha, mantenemos el trabajo en los resultados
      }
    }
    
    return true;
  });

  // Ordenar trabajos por fecha de creación (más recientes primero)
  filteredJobs.sort((a, b) => {
    try {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    } catch (e) {
      return 0;
    }
  });

  // Paginación
  const totalPages = Math.ceil(filteredJobs.length / pageSize);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="job-list-container">
      <div className="job-list-header">
        <h2>Ofertas de Empleo</h2>
        <button className="refresh-button" onClick={fetchJobs}>
          <i className="refresh-icon"></i>
          Actualizar ofertas
        </button>
      </div>
      
      <div className="job-list-info">
        <p>{filteredJobs.length} ofertas encontradas</p>
        
        {filteredJobs.length === 0 && jobs.length > 0 && (
          <div className="no-results">
            <p>No se encontraron ofertas que coincidan con los filtros seleccionados.</p>
            <p>Prueba a modificar los criterios de búsqueda.</p>
          </div>
        )}
      </div>

      {filteredJobs.length > 0 && (
        <>
          <div className="job-grid">
            {paginatedJobs.map((job) => (
              <JobDetail
                key={job.id}
                title={job.title}
                company={job.company}
                salary={job.salary}
                cardColor={getCardColor(job.type)}
                tags={
                  (() => {
                    const tagsArray: string[] = [];
                    // Agregar el tipo de trabajo
                    if (job.type === 'remoto') {
                      tagsArray.push('Remoto');
                    } else if (job.type === 'hibrido') {
                      tagsArray.push('Híbrido');
                    } else {
                      tagsArray.push('Presencial');
                    }
                    
                    // Agregar ubicación
                    if (job.location.country && job.location.country !== 'Desconocido') {
                      tagsArray.push(job.location.country);
                    }
                    
                    if (job.location.city && job.location.city !== '') {
                      tagsArray.push(job.location.city);
                    }
                    
                    if (job.location.province && job.location.province !== '') {
                      tagsArray.push(job.location.province);
                    }
                    
                    // Agregar la fuente
                    if (job.source) {
                      tagsArray.push(job.source);
                    }
                    
                    return tagsArray;
                  })()
                }
                description={job.description}
                created={job.created}
                redirect_url={job.redirect_url}
                source={job.source}
              />
            ))}
          </div>

          <div className="pagination">
            <button 
              className="page-button prev"
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <div className="page-info">
              Página {currentPage} de {totalPages}
            </div>
            <button 
              className="page-button next"
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default JobList;