-- Complete database schema for ShipTracker Pro
-- Run this SQL in your Supabase SQL Editor

-- First, create the users table (if not already exists)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Create the shipments table
CREATE TABLE IF NOT EXISTS public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tracking_number text UNIQUE NOT NULL,
  sender_name text NOT NULL,
  sender_address text NOT NULL,
  sender_phone text NOT NULL,
  receiver_name text NOT NULL,
  receiver_address text NOT NULL,
  receiver_phone text NOT NULL,
  package_weight numeric NOT NULL CHECK (package_weight > 0),
  package_dimensions text NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('standard', 'express', 'overnight')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled')),
  estimated_delivery timestamp with time zone,
  cost numeric NOT NULL CHECK (cost >= 0),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security on shipments
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Create policies for shipments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shipments' AND policyname = 'Users can read own shipments'
  ) THEN
    CREATE POLICY "Users can read own shipments"
      ON public.shipments
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shipments' AND policyname = 'Users can insert own shipments'
  ) THEN
    CREATE POLICY "Users can insert own shipments"
      ON public.shipments
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shipments' AND policyname = 'Users can update own shipments'
  ) THEN
    CREATE POLICY "Users can update own shipments"
      ON public.shipments
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create the tracking_events table
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES public.shipments(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  timestamp timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security on tracking_events
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Create policies for tracking_events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tracking_events' AND policyname = 'Users can read tracking events for own shipments'
  ) THEN
    CREATE POLICY "Users can read tracking events for own shipments"
      ON public.tracking_events
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.shipments 
          WHERE shipments.id = tracking_events.shipment_id 
          AND shipments.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tracking_events' AND policyname = 'System can insert tracking events'
  ) THEN
    CREATE POLICY "System can insert tracking events"
      ON public.tracking_events
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS shipments_user_id_idx ON public.shipments(user_id);
CREATE INDEX IF NOT EXISTS shipments_tracking_number_idx ON public.shipments(tracking_number);
CREATE INDEX IF NOT EXISTS shipments_status_idx ON public.shipments(status);
CREATE INDEX IF NOT EXISTS shipments_created_at_idx ON public.shipments(created_at DESC);
CREATE INDEX IF NOT EXISTS tracking_events_shipment_id_idx ON public.tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS tracking_events_timestamp_idx ON public.tracking_events(timestamp DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at (drop first if exists)
DROP TRIGGER IF EXISTS update_shipments_updated_at ON public.shipments;
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create tracking event when shipment status changes
CREATE OR REPLACE FUNCTION create_tracking_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create tracking event if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.tracking_events (shipment_id, status, description, location)
    VALUES (
      NEW.id,
      NEW.status,
      CASE NEW.status
        WHEN 'pending' THEN 'Shipment created and awaiting pickup'
        WHEN 'picked_up' THEN 'Package has been picked up from sender'
        WHEN 'in_transit' THEN 'Package is in transit to destination'
        WHEN 'out_for_delivery' THEN 'Package is out for delivery'
        WHEN 'delivered' THEN 'Package has been delivered successfully'
        WHEN 'cancelled' THEN 'Shipment has been cancelled'
        ELSE 'Status updated'
      END,
      CASE NEW.status
        WHEN 'pending' THEN 'Origin facility'
        WHEN 'picked_up' THEN NEW.sender_address
        WHEN 'in_transit' THEN 'Transit hub'
        WHEN 'out_for_delivery' THEN 'Local delivery facility'
        WHEN 'delivered' THEN NEW.receiver_address
        WHEN 'cancelled' THEN 'Origin facility'
        ELSE 'Unknown location'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically create tracking events (drop first if exists)
DROP TRIGGER IF EXISTS create_tracking_event_trigger ON public.shipments;
CREATE TRIGGER create_tracking_event_trigger
  AFTER INSERT OR UPDATE OF status ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION create_tracking_event();