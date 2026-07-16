export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type UserRole = 'administrator' | 'admin' | 'staff' | 'user'
type RentStatus = 'Paid' | 'Due' | 'Overdue'
type RoomStatus = 'occupied' | 'vacant' | 'maintenance'
type ActiveStatus = 'active' | 'inactive'
type VisitorStatus = 'pending' | 'approved' | 'arrived' | 'completed'
type MarketplaceStatus = 'available' | 'sold'
type BillStatus = 'pending' | 'paid' | 'overdue' | 'void'
type Priority = 'low' | 'normal' | 'high' | 'urgent'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: UserRole
          created_at: string
          avatar_url: string | null
          phone: string | null
          emergency_name: string | null
          emergency_relation: string | null
          emergency_phone: string | null
          pref_rent: boolean | null
          pref_maintenance: boolean | null
          pref_announcements: boolean | null
          pref_visitors: boolean | null
          pref_push: boolean | null
        }
        Insert: {
          id: string
          full_name: string
          role?: UserRole
          created_at?: string
          avatar_url?: string | null
          phone?: string | null
          emergency_name?: string | null
          emergency_relation?: string | null
          emergency_phone?: string | null
          pref_rent?: boolean | null
          pref_maintenance?: boolean | null
          pref_announcements?: boolean | null
          pref_visitors?: boolean | null
          pref_push?: boolean | null
        }
        Update: {
          id?: string
          full_name?: string
          role?: UserRole
          created_at?: string
          avatar_url?: string | null
          phone?: string | null
          emergency_name?: string | null
          emergency_relation?: string | null
          emergency_phone?: string | null
          pref_rent?: boolean | null
          pref_maintenance?: boolean | null
          pref_announcements?: boolean | null
          pref_visitors?: boolean | null
          pref_push?: boolean | null
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
          status: ActiveStatus
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          house_id?: string | null
          status?: ActiveStatus
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          house_id?: string | null
          status?: ActiveStatus
          created_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          number: string
          status: RoomStatus
          price: number
          description: string | null
          features: string[] | null
          images: string[] | null
          house_id: string | null
          max_occupants: number | null
          created_at: string
        }
        Insert: {
          id?: string
          number: string
          status?: RoomStatus
          price?: number
          description?: string | null
          features?: string[] | null
          images?: string[] | null
          house_id?: string | null
          max_occupants?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          number?: string
          status?: RoomStatus
          price?: number
          description?: string | null
          features?: string[] | null
          images?: string[] | null
          house_id?: string | null
          max_occupants?: number | null
          created_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          room_id: string | null
          profile_id: string | null
          rent_status: RentStatus
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          room_id?: string | null
          profile_id?: string | null
          rent_status?: RentStatus
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          room_id?: string | null
          profile_id?: string | null
          rent_status?: RentStatus
          due_date?: string | null
          created_at?: string
        }
      }
      maintenance_requests: {
        Row: {
          id: string
          room_id: string | null
          tenant_id: string | null
          subject: string
          description: string | null
          status: string
          date_reported: string | null
          image_url: string | null
          priority: Priority | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id?: string | null
          tenant_id?: string | null
          subject: string
          description?: string | null
          status?: string
          date_reported?: string | null
          image_url?: string | null
          priority?: Priority | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string | null
          tenant_id?: string | null
          subject?: string
          description?: string | null
          status?: string
          date_reported?: string | null
          image_url?: string | null
          priority?: Priority | null
          created_at?: string
        }
      }
      maintenance_updates: {
        Row: {
          id: string
          maintenance_request_id: string
          author_id: string | null
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          maintenance_request_id: string
          author_id?: string | null
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          maintenance_request_id?: string
          author_id?: string | null
          message?: string
          created_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          name: string
          role: string
          tasks: number
          status: ActiveStatus
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          tasks?: number
          status?: ActiveStatus
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          tasks?: number
          status?: ActiveStatus
          created_at?: string
        }
      }
      visitors: {
        Row: {
          id: string
          profile_id: string | null
          visitor_name: string
          date_of_visit: string
          status: VisitorStatus
          qr_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          visitor_name: string
          date_of_visit: string
          status?: VisitorStatus
          qr_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          visitor_name?: string
          date_of_visit?: string
          status?: VisitorStatus
          qr_code?: string | null
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
          status: MarketplaceStatus
          created_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          item_name: string
          price: number
          description?: string | null
          status?: MarketplaceStatus
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          item_name?: string
          price?: number
          description?: string | null
          status?: MarketplaceStatus
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
          priority: Priority | null
          is_urgent: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          house_id?: string | null
          author_id?: string | null
          title: string
          content: string
          priority?: Priority | null
          is_urgent?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          house_id?: string | null
          author_id?: string | null
          title?: string
          content?: string
          priority?: Priority | null
          is_urgent?: boolean | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          related_maintenance_request_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          related_maintenance_request_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          related_maintenance_request_id?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          tenant_id: string
          rent_bill_id: string | null
          amount: number
          description: string | null
          payment_method: string | null
          receipt_number: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          rent_bill_id?: string | null
          amount: number
          description?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          rent_bill_id?: string | null
          amount?: number
          description?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      rent_bills: {
        Row: {
          id: string
          tenant_id: string
          amount: number
          due_date: string | null
          billing_period: string | null
          status: BillStatus
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          amount: number
          due_date?: string | null
          billing_period?: string | null
          status?: BillStatus
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          amount?: number
          due_date?: string | null
          billing_period?: string | null
          status?: BillStatus
          paid_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          profile_id: string | null
          title: string
          body: string
          category: string | null
          priority: Priority
          related_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          title: string
          body: string
          category?: string | null
          priority?: Priority
          related_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          title?: string
          body?: string
          category?: string | null
          priority?: Priority
          related_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      push_subscriptions: {
        Row: {
          id: string
          profile_id: string
          endpoint: string
          subscription: Json
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          endpoint: string
          subscription: Json
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          endpoint?: string
          subscription?: Json
          created_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          platform_name: string
          support_email: string
          allow_registration: boolean
          maintenance_mode: boolean
          dark_mode_default: boolean
          theme_color: string
          curfew_enabled: boolean
          curfew_start: string
          curfew_end: string
          allow_visitors: boolean
          quiet_hours_enabled: boolean
          quiet_hours_start: string
          quiet_hours_end: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          platform_name?: string
          support_email?: string
          allow_registration?: boolean
          maintenance_mode?: boolean
          dark_mode_default?: boolean
          theme_color?: string
          curfew_enabled?: boolean
          curfew_start?: string
          curfew_end?: string
          allow_visitors?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_start?: string
          quiet_hours_end?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          platform_name?: string
          support_email?: string
          allow_registration?: boolean
          maintenance_mode?: boolean
          dark_mode_default?: boolean
          theme_color?: string
          curfew_enabled?: boolean
          curfew_start?: string
          curfew_end?: string
          allow_visitors?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_start?: string
          quiet_hours_end?: string
          created_at?: string
          updated_at?: string | null
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
