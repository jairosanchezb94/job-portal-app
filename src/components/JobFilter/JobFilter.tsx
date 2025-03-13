import React, { useState, useEffect } from 'react';
import { FilterValues } from '../../models/interfaces';
import './JobFilter.scss';

interface JobFilterProps {
  onFilterChange: (filterValues: FilterValues) => void;
  countries: string[];
}

const JobFilter: React.FC<JobFilterProps> = ({ onFilterChange, countries }) => {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    search: '',
    type: '',
    country: '',
    minSalary: 0,
    contractType: '',
    maxDays: 14
  });

  useEffect(() => {
    // Notificar al componente padre cada vez que cambian los filtros
    onFilterChange(filterValues);
  }, [filterValues, onFilterChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'minSalary') {
      setFilterValues({
        ...filterValues,
        [name]: Number(value)
      });
    } else {
      setFilterValues({
        ...filterValues,
        [name]: value
      });
    }
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilterValues({
      ...filterValues,
      [name]: Number(value)
    });
  };

  const resetFilters = () => {
    setFilterValues({
      search: '',
      type: '',
      country: '',
      minSalary: 0,
      contractType: '',
      maxDays: 14
    });
  };

  return (
    <div className="job-filter">
      <h3>Filtros</h3>
      
      <div className="filter-section">
        <label htmlFor="search">Búsqueda por palabra clave</label>
        <input
          type="text"
          id="search"
          name="search"
          value={filterValues.search}
          onChange={handleInputChange}
          placeholder="Desarrollador, Marketing, etc."
        />
      </div>
      
      <div className="filter-section">
        <label htmlFor="type">Tipo de trabajo</label>
        <select
          id="type"
          name="type"
          value={filterValues.type}
          onChange={handleInputChange}
        >
          <option value="">Todos</option>
          <option value="remoto">Remoto</option>
          <option value="hibrido">Híbrido</option>
          <option value="presencial">Presencial</option>
        </select>
      </div>
      
      <div className="filter-section">
        <label htmlFor="country">País</label>
        <select
          id="country"
          name="country"
          value={filterValues.country}
          onChange={handleInputChange}
        >
          <option value="">Todos</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
      
      <div className="filter-section">
        <label htmlFor="contractType">Tipo de contrato</label>
        <select
          id="contractType"
          name="contractType"
          value={filterValues.contractType}
          onChange={handleInputChange}
        >
          <option value="">Todos</option>
          <option value="fulltime">Tiempo completo</option>
          <option value="parttime">Medio tiempo</option>
        </select>
      </div>
      
      <div className="filter-section">
        <label htmlFor="minSalary">Salario mínimo</label>
        <input
          type="number"
          id="minSalary"
          name="minSalary"
          value={filterValues.minSalary}
          onChange={handleInputChange}
          min="0"
          step="1000"
        />
      </div>
      
      <div className="filter-section">
        <label htmlFor="maxDays">
          Antigüedad máxima: {filterValues.maxDays} días
        </label>
        <input
          type="range"
          id="maxDays"
          name="maxDays"
          value={filterValues.maxDays}
          onChange={handleRangeChange}
          min="1"
          max="30"
        />
      </div>
      
      <button className="reset-button" onClick={resetFilters}>
        Restablecer filtros
      </button>
    </div>
  );
};

export default JobFilter;