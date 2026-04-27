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
  maintenance_schedule_id: string | null;
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

export type BidStatus = "proposed" | "accepted" | "rejected";

export type TaskBid = {
  id: string;
  task_id: string;
  created_by: string;
  amount_cents: number;
  notes: string | null;
  status: BidStatus;
  created_at: string;
  updated_at: string;
};

export type TaskBidWithProfile = TaskBid & {
  creator: { full_name: string | null } | null;
};

export type TaskInvoice = {
  id: string;
  task_id: string;
  created_by: string;
  amount_cents: number;
  notes: string | null;
  paid_at: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskInvoiceWithProfile = TaskInvoice & {
  creator: { full_name: string | null } | null;
};

export type EquipmentCategory =
  | "hvac"
  | "septic"
  | "well"
  | "dock"
  | "generator"
  | "appliance"
  | "other";

export type Equipment = {
  id: string;
  name: string;
  category: EquipmentCategory;
  model: string | null;
  serial: string | null;
  install_date: string | null;
  manual_url: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type MaintenanceSchedule = {
  id: string;
  equipment_id: string;
  name: string;
  interval_months: number;
  last_completed_at: string;
  next_due_at: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type MaintenanceScheduleWithEquipment = MaintenanceSchedule & {
  equipment: Pick<Equipment, "id" | "name" | "category" | "model" | "manual_url"> | null;
};

export type ShoppingItem = {
  id: string;
  name: string;
  notes: string | null;
  added_by: string;
  picked_up_at: string | null;
  picked_up_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ShoppingItemWithProfiles = ShoppingItem & {
  adder: { full_name: string | null } | null;
  picker: { full_name: string | null } | null;
};
