/*
  # Create tracking events table for shipment history

  1. New Tables
    - `tracking_events`
      - `id` (uuid, primary key)
      - `shipment_id` (uuid, references shipments table)
      - `status` (text, not null)
      - `description` (text, not null)
      - `location` (text, not null)
      - `timestamp` (timestamp with timezone, defaults to now)

  2. Security
    - Enable RLS on `tracking_events` table
    - Add policy for authenticated users to read tracking events for their shipments

  3. Indexes
    - Index on shipment_id for faster queries
    - Index on timestamp for chronological ordering
*/

-- Create the tracking_events table
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES public.shipments(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  timestamp timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Create policy for RLS - users can read tracking events for their own shipments
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

-- Create policy for system to insert tracking events
CREATE POLICY "System can insert tracking events"
  ON public.tracking_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tracking_events_shipment_id_idx ON public.tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS tracking_events_timestamp_idx ON public.tracking_events(timestamp DESC);

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

-- Create trigger to automatically create tracking events
CREATE TRIGGER create_tracking_event_trigger
  AFTER INSERT OR UPDATE OF status ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION create_tracking_event();