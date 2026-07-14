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
      rooms: {
        Row: {
          id: string
          number: string
          status: 'occupied' | 'vacant' | 'maintenance'
          created_at: string
        }
        Insert: {
          id?: string
          number: string
          status?: 'occupied' | 'vacant' | 'maintenance'
          created_at?: string
        }
        Update: {
          id?: string
          number?: string
          status?: 'occupied' | 'vacant' | 'maintenance'
          created_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          room_id: string | null
          rent_status: 'Paid' | 'Due' | 'Overdue'
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          room_id?: string | null
          rent_status?: 'Paid' | 'Due' | 'Overdue'
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          room_id?: string | null
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
          created_at: string
        }
        Insert: {
          id?: string
          room_id?: string | null
          issue: string
          status?: 'pending' | 'in-progress' | 'done'
          date_reported?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string | null
          issue?: string
          status?: 'pending' | 'in-progress' | 'done'
          date_reported?: string | null
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
