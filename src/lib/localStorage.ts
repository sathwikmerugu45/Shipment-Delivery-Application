// Local storage utilities for shipments when Supabase is not available
import { Shipment, TrackingEvent, User } from '../types';

const STORAGE_KEYS = {
  SHIPMENTS: 'shiptracker_shipments',
  TRACKING_EVENTS: 'shiptracker_tracking_events',
  USERS: 'shiptracker_users',
  CURRENT_USER: 'shiptracker_current_user',
};

// Shipment operations
export const saveShipment = (shipment: Shipment): void => {
  const shipments = getShipments();
  const updatedShipments = [shipment, ...shipments.filter(s => s.id !== shipment.id)];
  localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(updatedShipments));
};

export const getShipments = (): Shipment[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
  return stored ? JSON.parse(stored) : [];
};

export const getShipmentsByUserId = (userId: string): Shipment[] => {
  return getShipments().filter(shipment => shipment.user_id === userId);
};

export const getShipmentByTrackingNumber = (trackingNumber: string): Shipment | null => {
  const shipments = getShipments();
  return shipments.find(s => s.tracking_number === trackingNumber) || null;
};

// Tracking events operations
export const saveTrackingEvent = (event: TrackingEvent): void => {
  const events = getTrackingEvents();
  const updatedEvents = [event, ...events.filter(e => e.id !== event.id)];
  localStorage.setItem(STORAGE_KEYS.TRACKING_EVENTS, JSON.stringify(updatedEvents));
};

export const getTrackingEvents = (): TrackingEvent[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.TRACKING_EVENTS);
  return stored ? JSON.parse(stored) : [];
};

export const getTrackingEventsByShipmentId = (shipmentId: string): TrackingEvent[] => {
  return getTrackingEvents().filter(event => event.shipment_id === shipmentId);
};

// User operations
export const saveUser = (user: User): void => {
  const users = getUsers();
  const updatedUsers = [user, ...users.filter(u => u.id !== user.id)];
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.USERS);
  return stored ? JSON.parse(stored) : [];
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return stored ? JSON.parse(stored) : null;
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Auto-generate tracking events for shipments
export const createTrackingEvent = (shipment: Shipment, status: string): void => {
  const event: TrackingEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    shipment_id: shipment.id,
    status,
    description: getStatusDescription(status),
    location: getStatusLocation(status, shipment),
    timestamp: new Date().toISOString(),
  };
  
  saveTrackingEvent(event);
};

const getStatusDescription = (status: string): string => {
  switch (status) {
    case 'pending': return 'Shipment created and awaiting pickup';
    case 'picked_up': return 'Package has been picked up from sender';
    case 'in_transit': return 'Package is in transit to destination';
    case 'out_for_delivery': return 'Package is out for delivery';
    case 'delivered': return 'Package has been delivered successfully';
    case 'cancelled': return 'Shipment has been cancelled';
    default: return 'Status updated';
  }
};

const getStatusLocation = (status: string, shipment: Shipment): string => {
  switch (status) {
    case 'pending': return 'Origin facility';
    case 'picked_up': return shipment.sender_address;
    case 'in_transit': return 'Transit hub';
    case 'out_for_delivery': return 'Local delivery facility';
    case 'delivered': return shipment.receiver_address;
    case 'cancelled': return 'Origin facility';
    default: return 'Unknown location';
  }
};