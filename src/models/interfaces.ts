export interface Job {
  id: string;
  title: string;
  company: string;
  salary: string;
  type: 'remoto' | 'hibrido' | 'presencial';
  location: {
    country: string;
    city?: string;
    province?: string;
  };
  description: string;
  created: string;
  redirect_url: string;
  source?: string;
}

export interface FilterValues {
  search: string;
  type: string;
  country: string;
  minSalary: number;
  contractType: string;
  maxDays: number;
}

export interface CountryJobStats {
  country: string;
  count: number;
  averageSalary: number;
  jobTypes: {
    remoto: number;
    hibrido: number;
    presencial: number;
  };
}

export interface AdzunaJob {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  salary_min?: number;
  salary_max?: number;
  salary?: string;
  salary_is_predicted?: number;
  description?: string;
  location?: {
    area?: string[];
  };
  created?: string;
  redirect_url?: string;
}

export interface RemotiveJob {
  id: number;
  title: string;
  company_name?: string;
  salary?: string;
  candidate_required_location?: string;
  description?: string;
  publication_date?: string;
  url?: string;
}

export interface RemoteOkJob {
  id: number;
  position?: string;
  title?: string;
  company?: string;
  salary?: string;
  location?: string;
  description?: string;
  date?: string;
  url?: string;
}