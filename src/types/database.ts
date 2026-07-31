export type Course = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  is_free: boolean;
  status: string;
  created_at: string;
  has_mock_exam: boolean;
  pass_mark_percent: number;
  exam_config: Record<string, unknown>;
};

export type Entitlement = {
  id: string;
  user_id: string;
  course_id: string;
  granted_at: string;
  courses?: Course;
};

export type UserCourse = Course & {
  entitlement_id?: string;
  access_type: "entitlement" | "free";
};
