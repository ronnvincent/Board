export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'administrator' | 'admin' | 'user'
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: 'administrator' | 'admin' | 'user'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'administrator' | 'admin' | 'user'
          created_at?: string
        }
      }
      houses: {
        Row: {
          id: string
          name: string
          rooms: number
          latitude: number | null
          longitude: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          rooms?: number
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          rooms?: number
          latitude?: number | null
          longitude?: number | null
          created_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          name: string
          email: string
          house_id: string | null
          status: 'active' | 'inactive'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          house_id?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          house_id?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          number: string
          status: 'occupied' | 'vacant' | 'maintenance'
          price: number
          description: string
          features: any
          images: any
          house_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          number: string
          status?: 'occupied' | 'vacant' | 'maintenance'
          price?: number
          description?: string
          features?: any
          images?: any
          house_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          number?: string
          status?: 'occupied' | 'vacant' | 'maintenance'
          price?: number
          description?: string
          features?: any
          images?: any
          house_id?: string | null
          created_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          room_id: string | null
          profile_id: string | null
          rent_status: 'Paid' | 'Due' | 'Overdue'
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          room_id?: string | null
          profile_id?: string | null
          rent_status?: 'Paid' | 'Due' | 'Overdue'
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          room_id?: string | null
          profile_id?: string | null
          rent_status?: 'Paid' | 'Due' | 'Overdue'
          due_date?: string | null
          created_at?: string
        }
      }
      maintenance_requests: {
        Row: {
          id: string
          room_id: string | null
          issue: string
          status: 'pending' | 'in-progress' | 'done'
          date_reported: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id?: string | null
          issue: string
          status?: 'pending' | 'in-progress' | 'done'
          date_reported?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string | null
          issue?: string
          status?: 'pending' | 'in-progress' | 'done'
          date_reported?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          name: string
          role: string
          tasks: number
          status: 'active' | 'inactive'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          tasks?: number
          status?: 'active' | 'inactive'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          tasks?: number
          status?: 'active' | 'inactive'
          created_at?: string
        }
      }
      visitors: {
        Row: {
          id: string
          profile_id: string | null
          visitor_name: string
          date_of_visit: string
          status: 'pending' | 'approved' | 'arrived' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          visitor_name: string
          date_of_visit: string
          status?: 'pending' | 'approved' | 'arrived' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          visitor_name?: string
          date_of_visit?: string
          status?: 'pending' | 'approved' | 'arrived' | 'completed'
          created_at?: string
        }
      }
      marketplace_items: {
        Row: {
          id: string
          profile_id: string | null
          item_name: string
          price: number
          description: string | null
          status: 'available' | 'sold'
          created_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          item_name: string
          price: number
          description?: string | null
          status?: 'available' | 'sold'
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          item_name?: string
          price?: number
          description?: string | null
          status?: 'available' | 'sold'
          created_at?: string
        }
      }
      notices: {
        Row: {
          id: string
          house_id: string | null
          author_id: string | null
          title: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          house_id?: string | null
          author_id?: string | null
          title: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          house_id?: string | null
          author_id?: string | null
          title?: string
          content?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
