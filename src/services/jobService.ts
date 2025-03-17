import { Job, CountryJobStats, AdzunaJob, RemotiveJob, RemoteOkJob } from '../models/interfaces';

// Variables de entorno que necesitaremos
const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID || '23aa7c91';
const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY || 'f369ddc7748fe2994860c5f232f1db1b';

export const fetchAdzunaJobs = async (): Promise<Job[]> => {
  try {
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/es/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=50`
    );
    if (!response.ok) {
      console.error("Adzuna response error:", response.status, response.statusText);
      return [];
    }
    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) {
      console.error("Adzuna data.results is not an array:", data);
      return [];
    }
    return data.results.map((job: AdzunaJob) => {
      let companyStr = "Sin compañía";
      if (job.company && typeof job.company === 'object' && typeof job.company.display_name === 'string') {
        companyStr = job.company.display_name;
      }
      let finalSalary = "";
      if (job.salary_min && job.salary_max) {
        finalSalary = `${job.salary_min} - ${job.salary_max} €`;
      } else if (job.salary) {
        finalSalary = job.salary;
      } else if (job.salary_is_predicted) {
        finalSalary = `${job.salary_is_predicted} €`;
      } else {
        finalSalary = "No lo indican en la oferta";
      }
      let finalType: 'remoto' | 'presencial' | 'hibrido' = 'presencial';
      
      // Intentamos determinar si es remoto o híbrido mediante palabras clave
      const description = job.description?.toLowerCase() || '';
      const title = job.title?.toLowerCase() || '';
      
      if (title.includes('remote') || description.includes('remote') || 
          title.includes('remoto') || description.includes('remoto')) {
        finalType = 'remoto';
      } else if (title.includes('hybrid') || description.includes('hybrid') || 
                title.includes('hibrido') || description.includes('híbrido')) {
        finalType = 'hibrido';
      }
      
      const createdDate = job.created || "";
      return {
        id: job.id,
        title: job.title,
        company: companyStr,
        salary: finalSalary,
        type: finalType,
        location: {
          country: job.location?.area?.[0] || "Desconocido",
          province: job.location?.area?.[1] || "",
          city: job.location?.area?.[2] || ""
        },
        description: job.description || "Sin descripción",
        created: createdDate,
        redirect_url: job.redirect_url || "",
        source: "Adzuna"
      };
    });
  } catch (error) {
    console.error("Error in fetchAdzunaJobs:", error);
    return [];
  }
};

export const fetchRemotiveJobs = async (): Promise<Job[]> => {
  try {
    const response = await fetch('https://remotive.com/api/remote-jobs');
    if (!response.ok) {
      console.error("Remotive response error:", response.status, response.statusText);
      return [];
    }
    const data = await response.json();
    if (!data.jobs || !Array.isArray(data.jobs)) {
      console.error("Remotive data.jobs is not an array:", data);
      return [];
    }
    return data.jobs.map((job: RemotiveJob) => ({
      id: job.id.toString(),
      title: job.title,
      company: job.company_name || "Sin compañía",
      salary: job.salary ? job.salary : "No lo indican en la oferta",
      type: 'remoto',
      location: {
        country: job.candidate_required_location || "Desconocido",
        city: "",
        province: ""
      },
      description: job.description || "Sin descripción",
      created: job.publication_date || "",
      redirect_url: job.url || "",
      source: "Remotive"
    }));
  } catch (error) {
    console.error("Error in fetchRemotiveJobs:", error);
    return [];
  }
};

export const fetchRemoteOkJobs = async (): Promise<Job[]> => {
  try {
    // Nota: La API de RemoteOK puede requerir un encabezado User-Agent
    const response = await fetch('https://remoteok.com/api', {
      headers: {
        'User-Agent': 'JobPortal/1.0',
      }
    });
    if (!response.ok) {
      console.error("Remote OK response error:", response.status, response.statusText);
      return [];
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      console.error("Remote OK data is not an array:", data);
      return [];
    }
    const jobsArray = data.filter((job: RemoteOkJob) => job.id && job.id !== 0);
    return jobsArray.map((job: RemoteOkJob) => ({
      id: job.id.toString(),
      title: job.position || job.title || "Sin título",
      company: job.company || "Sin compañía",
      salary: job.salary ? job.salary : "No lo indican en la oferta",
      type: 'remoto',
      location: {
        country: job.location || "Remoto",
        city: "",
        province: ""
      },
      description: job.description || "Sin descripción",
      created: job.date || "",
      redirect_url: job.url || "",
      source: "RemoteOK"
    }));
  } catch (error) {
    console.error("Error in fetchRemoteOkJobs:", error);
    return [];
  }
};

// Función que combina los trabajos de todas las fuentes
export const fetchAllJobs = async (): Promise<Job[]> => {
  try {
    const [adzunaJobs, remotiveJobs, remoteOkJobs] = await Promise.all([
      fetchAdzunaJobs(),
      fetchRemotiveJobs(),
      fetchRemoteOkJobs()
    ]);

    return [...adzunaJobs, ...remotiveJobs, ...remoteOkJobs];
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    return [];
  }
};

// Función para obtener estadísticas por país
export const getCountryStats = (jobs: Job[]): CountryJobStats[] => {
  const countryMap = new Map<string, CountryJobStats>();
  
  jobs.forEach(job => {
    const country = job.location.country;
    if (!country || country === "Desconocido") return;
    
    // Normalizamos el nombre del país para agrupar correctamente
    let normalizedCountry = country;
    if (country.toLowerCase().includes('españa') || country.toLowerCase().includes('spain')) {
      normalizedCountry = 'España';
    } else if (country.toLowerCase().includes('united states') || country.toLowerCase() === 'usa' || country.toLowerCase() === 'us') {
      normalizedCountry = 'United States';
    }
    
    // Extraemos valor salarial para calcular promedio (si está disponible)
    let salaryValue = 0;
    const salaryMatch = job.salary.match(/(\d+(\.\d+)?)/);
    if (salaryMatch) {
      salaryValue = parseFloat(salaryMatch[1]);
    }
    
    if (!countryMap.has(normalizedCountry)) {
      countryMap.set(normalizedCountry, {
        country: normalizedCountry,
        count: 0,
        averageSalary: 0,
        jobTypes: {
          remoto: 0,
          hibrido: 0,
          presencial: 0
        }
      });
    }
    
    const stats = countryMap.get(normalizedCountry);
    if (!stats) return;
    
    stats.count += 1;
    stats.jobTypes[job.type] += 1;
    
    // Actualizar salario promedio
    if (salaryValue > 0) {
      if (stats.averageSalary === 0) {
        stats.averageSalary = salaryValue;
      } else {
        stats.averageSalary = (stats.averageSalary + salaryValue) / 2;
      }
    }
  });
  
  // Convertir el Map a un array y ordenar por cantidad de empleos
  return Array.from(countryMap.values())
    .sort((a, b) => b.count - a.count);
};