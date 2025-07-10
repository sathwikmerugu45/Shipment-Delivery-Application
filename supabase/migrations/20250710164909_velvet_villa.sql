/*
  # Create shipments table for package tracking

  1. New Tables
    - `shipments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users table)
      - `tracking_number` (text, unique, not null)
      - `sender_name` (text, not null)
      - `sender_address` (text, not null)
      - `sender_phone` (text, not null)
      - `receiver_name` (text, not null)
      - `receiver_address` (text, not null)
      - `receiver_phone` (text, not null)
      - `package_weight` (numeric, not null)
      - `package_dimensions` (text, not null)
      - `service_type` (text, not null, check constraint)
      - `status` (text, not null, check constraint)
      - `estimated_delivery` (timestamp with timezone)
      - `cost` (numeric, not null)
      - `payment_status` (text, not null, check constraint)
      - `created_at` (timestamp with timezone, defaults to now)
      - `updated_at` (timestamp with timezone, defaults to now)

  2. Security
    - Enable RLS on `shipments` table
    - Add policy for authenticated users to read their own shipments
    - Add policy for authenticated users to insert their own shipments
    - Add policy for authenticated users to update their own shipments

  3. Indexes
    - Index on user_id for faster queries
    - Index on tracking_number for faster lookups
    - Index on status for filtering
*/

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

-- Enable Row Level Security
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can read own shipments"
  ON public.shipments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shipments"
  ON public.shipments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shipments"
  ON public.shipments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS shipments_user_id_idx ON public.shipments(user_id);
CREATE INDEX IF NOT EXISTS shipments_tracking_number_idx ON public.shipments(tracking_number);
CREATE INDEX IF NOT EXISTS shipments_status_idx ON public.shipments(status);
CREATE INDEX IF NOT EXISTS shipments_created_at_idx ON public.shipments(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();