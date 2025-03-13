import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import JobList from '../JobList/JobList';
import JobFilter from '../JobFilter/JobFilter';
import JobAnalytics from '../JobAnalytics/JobAnalytics';
import { Job, FilterValues } from '../../models/interfaces';
import './App.scss';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'analytics'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>({
    search: '',
    type: '',
    country: '',
    minSalary: 0,
    contractType: '',
    maxDays: 14
  });

  // Cuando se obtienen los trabajos, extraer los países para los filtros
  const handleJobsFetched = (fetchedJobs: Job[]) => {
    setJobs(fetchedJobs);
    
    // Extraer países únicos para el filtro
    const uniqueCountries = Array.from(
      new Set(
        fetchedJobs
          .map(job => job.location.country)
          .filter(country => country && country !== 'Desconocido')
      )
    ).sort();
    
    setCountries(uniqueCountries);
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (newFilterValues: FilterValues) => {
    setFilterValues(newFilterValues);
  };

  return (
    <div className="app">
      <Navbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <main className="main-content">
        <div className="container">
          {activeTab === 'jobs' ? (
            <div className="two-columns">
              <aside className="sidebar">
                <JobFilter 
                  onFilterChange={handleFilterChange} 
                  countries={countries} 
                />
              </aside>
              
              <div className="content">
                <JobList 
                  filterValues={filterValues} 
                  onJobsFetched={handleJobsFetched} 
                />
              </div>
            </div>
          ) : (
            <JobAnalytics jobs={jobs} />
          )}
        </div>
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Job Portal. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;