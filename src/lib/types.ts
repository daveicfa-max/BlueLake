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

export type TaskStatus = "open" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "normal" | "high";
export type TaskSeason =
  | "open"
  | "close"
  | "spring"
  | "summer"
  | "fall"
  | "winter";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  due_date: string | null;
  is_seasonal: boolean;
  season: TaskSeason | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type TaskWithProfiles = Task & {
  assignee: { full_name: string | null } | null;
  creator: { full_name: string | null } | null;
};

export type Profile = {
  id: string;
  full_name: string | null;
  role: "owner" | "family" | "handyman" | "guest";
  phone: string | null;
  avatar_url: string | null;
};
