export interface Course {
  id: string;
  category_id: number | null;
  category_name?: string;
  category_slug?: string;
  title: string;
  slug: string;
  short_description: string;
  overview?: string;
  duration: string;
  fees: number | null;
  eligibility?: string;
  skills_learned?: string;
  career_opportunities?: string;
  tools_covered?: string;
  certificate_info?: string;
  image_url?: string | null;
  brochure_url?: string | null;
  is_published: number;
  display_order: number;
}

export interface CourseCategory {
  id: number;
  name: string;
  slug: string;
  display_order: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  display_order: number;
}

export interface CourseFaq {
  id: string;
  question: string;
  answer: string;
}

export interface SiteSettings {
  institute_name?: string;
  tagline?: string;
  address_line?: string;
  phone?: string;
  whatsapp_number?: string;
  email?: string;
  google_maps_link?: string;
  working_hours?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  google_business_url?: string;
  website_title?: string;
  seo_description?: string;
  founder_name?: string;
  founder_title?: string;
  [key: string]: string | undefined;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  course_id: string | null;
  course_title?: string;
  discount_text: string;
  banner_image_url: string | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: number;
}

export interface GalleryImage {
  id: string;
  category: string;
  image_url: string;
  caption: string;
}

export interface Testimonial {
  id: string;
  student_name: string;
  review: string;
  photo_url: string | null;
  course_title?: string;
}

export interface Enquiry {
  id: string;
  student_name: string;
  mobile: string;
  email: string | null;
  course_id: string | null;
  course_title?: string;
  qualification: string | null;
  preferred_batch: string | null;
  preferred_mode: string | null;
  message: string | null;
  status: "new" | "contacted" | "follow_up" | "converted" | "closed";
  follow_up_notes: string | null;
  created_at: string;
}

export interface CurrentUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: "admin" | "staff" | "student";
}
