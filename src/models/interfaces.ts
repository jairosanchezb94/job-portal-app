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
  averageSalary?: number;
  jobTypes: {
    remoto: number;
    hibrido: number;
    presencial: number;
  };
}