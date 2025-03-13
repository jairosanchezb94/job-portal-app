import React, { useState, useEffect } from 'react';
import { Job, CountryJobStats } from '../../models/interfaces';
import { getCountryStats } from '../../services/jobService';
import './JobAnalytics.scss';

interface JobAnalyticsProps {
  jobs: Job[];
}

const JobAnalytics: React.FC<JobAnalyticsProps> = ({ jobs }) => {
  const [countryStats, setCountryStats] = useState<CountryJobStats[]>([]);
  const [viewMode, setViewMode] = useState<'chart' | 'map'>('chart');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  
  useEffect(() => {
    if (jobs.length > 0) {
      const stats = getCountryStats(jobs);
      setCountryStats(stats);
    }
  }, [jobs]);
  
  const getTop10Countries = () => {
    return countryStats.slice(0, 10);
  };
  
  const getMaxCount = () => {
    if (countryStats.length === 0) return 0;
    return countryStats[0].count;
  };
  
  const getCountryColor = (count: number) => {
    const maxCount = getMaxCount();
    if (maxCount === 0) return '#f8f5f6'; // Fondo muy claro para países sin datos
    
    // Calculamos la intensidad en base al recuento
    const intensity = Math.max(0.2, Math.min(0.9, count / maxCount));
    
    if (intensity < 0.3) {
      // Para valores bajos, usamos tonos del gris
      return `rgba(150, 144, 145, ${intensity + 0.2})`;  // #969091 con opacidad
    } else if (intensity < 0.6) {
      // Para valores medios, mezclamos con el amarillo claro
      return `rgba(255, 233, 153, ${intensity + 0.1})`; // #ffe999 con opacidad
    } else {
      // Para valores altos, usamos el amarillo intenso
      return `rgba(255, 217, 82, ${intensity})`; // #ffd952 con opacidad
    }
  };
  
  const handleCountryClick = (country: string) => {
    // console.log("País seleccionado:", country, "País actual:", selectedCountry);
    setSelectedCountry(prevCountry => country === prevCountry ? '' : country);
  };
  
  const BarChart = () => (
    <div className="bar-chart">
      <h3>Top 10 países con más ofertas de empleo</h3>
      <div className="chart-container">
        {getTop10Countries().map((stat) => (
          <div 
            key={stat.country}
            className="chart-bar-container"
            onClick={() => handleCountryClick(stat.country)}
          >
            <div className="chart-label">{stat.country}</div>
            <div className="chart-bar-wrapper">
              <div 
                className={`chart-bar ${selectedCountry === stat.country ? 'selected' : ''}`}
                style={{ 
                  width: `${(stat.count / getMaxCount()) * 100}%`,
                  backgroundColor: getCountryColor(stat.count)
                }}
              >
                <span className="chart-value">{stat.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedCountry && (
        <CountryDetail country={selectedCountry} />
      )}
    </div>
  );
  
  const WorldMap = () => {
    return (
      <div className="world-map">
        <h3>Distribución global de ofertas de empleo</h3>
        <div className="map-container">
          <div className="map-visualization" style={{ overflow: 'hidden', position: 'relative' }}>
            {/* Fondo de mapa mundial */}
            <svg width="100%" height="400" viewBox="0 0 800 450" style={{ position: 'absolute', top: 0, left: 0 }}>
              <image
                href="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
                width="800"
                height="450"
                style={{ opacity: 0.2 }}
              />
            </svg>
            
            {/* Círculos de países con ofertas */}
            <svg width="100%" height="400" viewBox="0 0 800 450" style={{ position: 'relative' }}>
              {countryStats.map(stat => {
                // Posiciones aproximadas de países en nuestro mapa simplificado
                const countryPositions: Record<string, [number, number, number]> = {
                  "United States": [200, 180, 30],
                  "España": [420, 190, 15],
                  "Germany": [460, 160, 15],
                  "UK": [415, 150, 15],
                  "Canada": [200, 150, 20],
                  "India": [560, 210, 18],
                  "Australia": [680, 300, 18],
                  "Brazil": [330, 280, 18],
                  "Mexico": [170, 210, 15],
                  "Poland": [480, 160, 12],
                  "France": [430, 170, 15],
                  "Japan": [680, 180, 15],
                  "China": [620, 180, 20],
                  "Russia": [550, 130, 25],
                  "Philippines": [650, 230, 15],
                  "Ukraine": [510, 160, 12],
                  "USA, Canada": [200, 165, 22],
                  "LATAM": [270, 250, 18],
                  "Europe": [450, 170, 20],
                  "Europe, UK": [440, 160, 18],
                  "Worldwide": [400, 230, 20],
                  "Remote": [350, 200, 18],
                  "Portugal": [410, 200, 12],
                  "Colombia": [250, 250, 12],
                  "South Africa": [490, 320, 12],
                  "Argentina": [290, 320, 12],
                  "Americas": [220, 220, 12],
                  "Ireland": [400, 150, 12],
                  "EMEA": [470, 200, 12],
                  "Asia": [600, 210, 15],
                  // Añadir más países según sea necesario
                };
                
                // Normalizar el nombre del país para encontrar su posición
                const normalizedName = Object.keys(countryPositions).find(
                  key => key.toLowerCase() === stat.country.toLowerCase()
                ) || stat.country;
                
                // Verificar si tenemos posición para este país
                const position = countryPositions[normalizedName];
                if (!position) return null;
                
                const [x, y, baseRadius] = position;
                const scale = Math.sqrt(stat.count) / 15 + 0.5; // Escalar según número de ofertas
                const radius = baseRadius * scale;
                
                return (
                  <g key={stat.country} onClick={() => handleCountryClick(stat.country)} style={{ cursor: 'pointer' }}>
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={radius}
                      fill={getCountryColor(stat.count)}
                      stroke="#FFFFFF"
                      strokeWidth="1"
                    />
                    <text 
                      x={x} 
                      y={y} 
                      textAnchor="middle" 
                      alignmentBaseline="middle" 
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {stat.count}
                    </text>
                    <text 
                      x={x} 
                      y={y + radius + 10} 
                      textAnchor="middle" 
                      fill="#000000"
                      fontSize="9"
                      fontWeight="500"
                    >
                      {stat.country}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          
          <div className="map-legend">
            <h4>Leyenda</h4>
            <div className="legend-items">
              {[0.2, 0.4, 0.6, 0.8].map((intensity) => (
                <div key={intensity} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ 
                      backgroundColor: intensity < 0.3 
                        ? 'rgba(150, 144, 145, 0.4)' 
                        : intensity < 0.6 
                          ? 'rgba(255, 233, 153, 0.5)' 
                          : 'rgba(255, 217, 82, 0.8)' 
                    }}
                  ></div>
                  <div className="legend-label">
                    {Math.round(intensity * getMaxCount())} ofertas
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="country-list">
          <h4>Países con ofertas</h4>
          <div className="country-grid">
            {countryStats.map((stat) => (
              <div 
                key={stat.country}
                className={`country-item ${selectedCountry === stat.country ? 'selected' : ''}`}
                style={{ 
                  backgroundColor: getCountryColor(stat.count),
                  border: selectedCountry === stat.country ? '2px solid #000' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => handleCountryClick(stat.country)}
              >
                <div className="country-name">{stat.country}</div>
                <div className="country-count">{stat.count}</div>
              </div>
            ))}
          </div>
        </div>
        
        {selectedCountry && (
          <div className="country-detail-wrapper" style={{ marginTop: '20px' }}>
            <CountryDetail country={selectedCountry} />
          </div>
        )}
      </div>
    );
  };
  
  const CountryDetail = ({ country }: { country: string }) => {
    const countryStat = countryStats.find(stat => stat.country === country);
    
    if (!countryStat) return null;
    
    return (
      <div className="country-detail">
        <h3>Detalles para {country}</h3>
        
        <div className="detail-stats">
          <div className="detail-stat">
            <span className="stat-label">Total de ofertas:</span>
            <span className="stat-value">{countryStat.count}</span>
          </div>
          
          {countryStat.averageSalary && countryStat.averageSalary > 0 && (
            <div className="detail-stat">
              <span className="stat-label">Salario promedio:</span>
              <span className="stat-value">
                {Math.round(countryStat.averageSalary).toLocaleString()} €
              </span>
            </div>
          )}
        </div>
        
        <div className="job-type-distribution">
          <h4>Distribución por tipo de trabajo</h4>
          <div className="type-bars">
            <div className="type-bar-container">
              <div className="type-label">Remoto</div>
              <div className="type-bar-wrapper">
                <div 
                  className="type-bar remote"
                  style={{ 
                    width: `${(countryStat.jobTypes.remoto / countryStat.count) * 100}%` 
                  }}
                >
                  <span className="type-value">
                    {countryStat.jobTypes.remoto} 
                    ({Math.round((countryStat.jobTypes.remoto / countryStat.count) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="type-bar-container">
              <div className="type-label">Híbrido</div>
              <div className="type-bar-wrapper">
                <div 
                  className="type-bar hybrid"
                  style={{ 
                    width: `${(countryStat.jobTypes.hibrido / countryStat.count) * 100}%` 
                  }}
                >
                  <span className="type-value">
                    {countryStat.jobTypes.hibrido}
                    ({Math.round((countryStat.jobTypes.hibrido / countryStat.count) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="type-bar-container">
              <div className="type-label">Presencial</div>
              <div className="type-bar-wrapper">
                <div 
                  className="type-bar onsite"
                  style={{ 
                    width: `${(countryStat.jobTypes.presencial / countryStat.count) * 100}%` 
                  }}
                >
                  <span className="type-value">
                    {countryStat.jobTypes.presencial}
                    ({Math.round((countryStat.jobTypes.presencial / countryStat.count) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="job-analytics">
      <div className="analytics-header">
        <h2>Análisis de Mercado Laboral</h2>
        <div className="view-toggle">
          <button 
            className={`toggle-button ${viewMode === 'chart' ? 'active' : ''}`}
            onClick={() => setViewMode('chart')}
          >
            Gráfico de Barras
          </button>
          <button 
            className={`toggle-button ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            Mapa Global
          </button>
        </div>
      </div>
      
      <div className="analytics-content">
        {jobs.length === 0 ? (
          <div className="no-data">
            <p>No hay datos disponibles para mostrar análisis.</p>
            <p>Por favor, espere a que se carguen las ofertas de empleo.</p>
          </div>
        ) : viewMode === 'chart' ? (
          <BarChart />
        ) : (
          <WorldMap />
        )}
      </div>
      
      <div className="analytics-summary">
        <h3>Resumen General</h3>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-value">{jobs.length}</span>
            <span className="stat-label">Ofertas totales</span>
          </div>
          
          <div className="summary-stat">
            <span className="stat-value">{countryStats.length}</span>
            <span className="stat-label">Países</span>
          </div>
          
          <div className="summary-stat">
            <span className="stat-value">
              {countryStats.reduce((sum, stat) => sum + stat.jobTypes.remoto, 0)}
            </span>
            <span className="stat-label">Trabajos remotos</span>
          </div>
          
          <div className="summary-stat">
            <span className="stat-value">
              {Math.round(countryStats.reduce((sum, stat) => {
                const jobsWithSalary = jobs.filter(job => 
                  job.location.country === stat.country && 
                  job.salary.match(/\d+/)
                ).length;
                return jobsWithSalary > 0 ? sum + 1 : sum;
              }, 0) / Math.max(1, countryStats.length) * 100)}%
            </span>
            <span className="stat-label">Ofertas con salario</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAnalytics;