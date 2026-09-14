export type Me = {
  business_id: string;
  business_name: string;
  auth_user_id: string;
  role: string;
};

export type Worker = {
  id: string;
  name: string;
  mobile_number: string;
  daily_wage: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkerCreateInput = {
  name: string;
  mobile_number: string;
  daily_wage: number;
};

export type Site = {
  id: string;
  name: string;
  start_date: string | null;
  is_active: boolean;
  created_at: string;
};

export type SiteCreateInput = {
  name: string;
  start_date?: string | null;
};

export type SiteUpdateInput = {
  name?: string;
  start_date?: string | null;
  is_active?: boolean;
};
