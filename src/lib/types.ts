export type Stay = {
  id: string;
  user_id: string;
  guest_name: string | null;
  start_date: string;
  end_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type StayWithProfile = Stay & {
  profile: {
    full_name: string | null;
  } | null;
};
