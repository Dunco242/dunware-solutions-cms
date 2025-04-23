import { createClient } from '@supabase/supabase-js';

interface Location {
  lat: number;
  lng: number;
  address: string;
  type?: 'business' | 'residential' | 'industrial';
  accessNotes?: string;
}

interface RouteStop {
  id: string;
  location: Location;
  order: number;
  estimatedTime: string;
  actualTime?: string;
  status: 'pending' | 'completed' | 'skipped' | 'delayed';
  duration: number;
  notes?: string[];
}

interface Route {
  id: string;
  name: string;
  description?: string;
  date: string;
  startLocation: Location;
  endLocation: Location;
  stops: RouteStop[];
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo: string;
  optimizationStatus: 'not_optimized' | 'optimizing' | 'optimized';
  estimatedDuration: number;
  actualDuration?: number;
  distance: number;
}

class RouteService {
  private supabase;
  private map: any = null;
  private platform: any = null;
  private routingService: any = null;
  private technicians: Map<string, any> = new Map();
  private routes: Map<string, any> = new Map();

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async initializeMap(container: HTMLElement) {
    try {
      // Load HERE Maps script
      const script = document.createElement('script');
      script.src = `https://js.api.here.com/v3/3.1/mapsjs-core.js`;
      document.head.appendChild(script);

      await new Promise(resolve => script.onload = resolve);

      // Load additional modules
      await Promise.all([
        this.loadScript('https://js.api.here.com/v3/3.1/mapsjs-service.js'),
        this.loadScript('https://js.api.here.com/v3/3.1/mapsjs-mapevents.js'),
        this.loadScript('https://js.api.here.com/v3/3.1/mapsjs-ui.js'),
        this.loadScript('https://js.api.here.com/v3/3.1/mapsjs-clustering.js'),
      ]);

      // Initialize HERE platform
      this.platform = new H.service.Platform({
        apikey: import.meta.env.VITE_HERE_API_KEY
      });

      // Initialize map
      const defaultLayers = this.platform.createDefaultLayers();
      this.map = new H.Map(
        container,
        defaultLayers.vector.normal.map,
        {
          zoom: 10,
          center: { lat: 40.7128, lng: -74.0060 }
        }
      );

      // Add UI controls
      const ui = new H.ui.UI(this.map, defaultLayers);

      // Enable map events
      const mapEvents = new H.mapevents.MapEvents(this.map);
      new H.mapevents.Behavior(mapEvents);

      // Initialize routing service
      this.routingService = this.platform.getRoutingService(null, 8);

      return this.map;
    } catch (error) {
      console.error('Error initializing map:', error);
      throw error;
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  async createRoute(route: Omit<Route, 'id' | 'optimizationStatus' | 'distance'>) {
    try {
      // Calculate initial route
      const routeResult = await this.calculateRoute([
        route.startLocation,
        ...route.stops.map(stop => stop.location),
        route.endLocation
      ]);

      const { data, error } = await this.supabase
        .from('routes')
        .insert({
          name: route.name,
          description: route.description,
          date: route.date,
          start_location: route.startLocation,
          end_location: route.endLocation,
          status: route.status,
          assigned_to: route.assignedTo,
          estimated_duration: routeResult.duration,
          total_distance: routeResult.distance,
          optimization_status: 'not_optimized'
        })
        .select()
        .single();

      if (error) throw error;

      // Create route stops
      const stopsPromises = route.stops.map((stop, index) =>
        this.supabase
          .from('route_stops')
          .insert({
            route_id: data.id,
            stop_order: index + 1,
            location: stop.location,
            duration: stop.duration,
            status: 'pending'
          })
      );

      await Promise.all(stopsPromises);

      return data;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  }

  async getRoute(id: string) {
    try {
      const { data: route, error: routeError } = await this.supabase
        .from('routes')
        .select(`
          *,
          stops:route_stops (
            *,
            contact:contacts (*)
          ),
          assigned_to:auth.users!routes_assigned_to_fkey (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('id', id)
        .single();

      if (routeError) throw routeError;

      return route;
    } catch (error) {
      console.error('Error getting route:', error);
      throw error;
    }
  }

  async updateRouteStatus(id: string, status: Route['status']) {
    try {
      const { data, error } = await this.supabase
        .from('routes')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating route status:', error);
      throw error;
    }
  }

  async updateStopStatus(id: string, status: RouteStop['status']) {
    try {
      const { data, error } = await this.supabase
        .from('route_stops')
        .update({
          status,
          actual_arrival: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating stop status:', error);
      throw error;
    }
  }

  async optimizeRoute(routeId: string) {
    try {
      // Get current route
      const route = await this.getRoute(routeId);
      
      // Update optimization status
      await this.supabase
        .from('routes')
        .update({ optimization_status: 'optimizing' })
        .eq('id', routeId);

      // Prepare waypoints
      const waypoints = [
        route.start_location,
        ...route.stops.map((stop: any) => stop.location),
        route.end_location
      ];

      // Calculate optimized route
      const optimizedRoute = await this.calculateRoute(waypoints, true);

      // Store optimization results
      const { data: optimization, error: optimizationError } = await this.supabase
        .from('route_optimizations')
        .insert({
          route_id: routeId,
          original_stops: route.stops,
          optimized_stops: optimizedRoute.waypoints,
          distance_saved: route.total_distance - optimizedRoute.distance,
          time_saved: route.estimated_duration - optimizedRoute.duration,
          algorithm_used: 'here_matrix'
        })
        .select()
        .single();

      if (optimizationError) throw optimizationError;

      // Update route with optimized data
      const { error: routeError } = await this.supabase
        .from('routes')
        .update({
          optimization_status: 'optimized',
          total_distance: optimizedRoute.distance,
          estimated_duration: optimizedRoute.duration
        })
        .eq('id', routeId);

      if (routeError) throw routeError;

      // Update stop orders
      const updatePromises = optimizedRoute.waypoints.map((waypoint: any, index: number) =>
        this.supabase
          .from('route_stops')
          .update({ stop_order: index + 1 })
          .eq('id', waypoint.id)
      );

      await Promise.all(updatePromises);

      return optimization;
    } catch (error) {
      console.error('Error optimizing route:', error);
      
      // Reset optimization status on error
      await this.supabase
        .from('routes')
        .update({ optimization_status: 'not_optimized' })
        .eq('id', routeId);
      
      throw error;
    }
  }

  async calculateRoute(waypoints: Location[], optimize = false) {
    try {
      // Validate HERE API key
      const apiKey = import.meta.env.VITE_HERE_API_KEY;
      if (!apiKey) {
        throw new Error('HERE Maps API key is not configured');
      }

      // Validate waypoints
      if (!waypoints.length || waypoints.length < 2) {
        throw new Error('At least 2 waypoints are required for route calculation');
      }

      const params = {
        'mode': 'fastest;car;traffic:enabled',
        'representation': 'display',
        'routeAttributes': 'summary,shape',
        'alternatives': 0,
        'apiKey': apiKey
      };

      if (optimize) {
        params['improveFor'] = 'time';
        params['optimizeFor'] = 'shortestTime';
      }

      // Build waypoint parameters
      const waypointParams = waypoints.map((waypoint, index) => ({
        [`waypoint${index}`]: `geo!${waypoint.lat},${waypoint.lng}`
      }));

      // Construct URL with proper encoding
      const url = new URL('https://router.hereapi.com/v8/routes');
      Object.entries({ ...params, ...Object.assign({}, ...waypointParams) })
        .forEach(([key, value]) => url.searchParams.append(key, value as string));

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Route calculation failed: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.routes?.[0]?.sections?.[0]) {
        throw new Error('Invalid route response from HERE API');
      }

      const route = data.routes[0];
      const section = route.sections[0];

      return {
        distance: section.summary.length / 1000, // Convert to km
        duration: section.summary.duration / 60, // Convert to minutes
        shape: section.shape,
        waypoints: waypoints.map((waypoint, index) => ({
          ...waypoint,
          estimatedTime: new Date(
            Date.now() + (section.summary.duration * (index / waypoints.length)) * 1000
          ).toISOString()
        }))
      };
    } catch (error) {
      console.error('Error calculating route:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to calculate route');
    }
  }

  async startTechnicianTracking(technicianId: string) {
    try {
      const channel = this.supabase.channel(`technician-${technicianId}`);
      
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          this.updateTechnicianLocation(technicianId, state);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          this.updateTechnicianLocation(technicianId, newPresences[0]);
        })
        .on('presence', { event: 'leave' }, () => {
          this.removeTechnicianMarker(technicianId);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              online_at: new Date().toISOString(),
            });
          }
        });

      this.technicians.set(technicianId, channel);
    } catch (error) {
      console.error('Error starting technician tracking:', error);
      throw error;
    }
  }

  async stopTechnicianTracking(technicianId: string) {
    const channel = this.technicians.get(technicianId);
    if (channel) {
      await channel.unsubscribe();
      this.technicians.delete(technicianId);
      this.removeTechnicianMarker(technicianId);
    }
  }

  private async updateTechnicianLocation(technicianId: string, state: any) {
    if (!this.map) return;

    try {
      // Remove existing marker
      this.removeTechnicianMarker(technicianId);

      // Create new marker
      const marker = new H.map.Marker({
        lat: state.latitude,
        lng: state.longitude
      }, {
        volatility: true
      });

      // Add marker to map
      this.map.addObject(marker);
      this.routes.set(technicianId, marker);

      // Update location in database
      await this.supabase
        .from('technician_locations')
        .upsert({
          technician_id: technicianId,
          latitude: state.latitude,
          longitude: state.longitude,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating technician location:', error);
      throw error;
    }
  }

  private removeTechnicianMarker(technicianId: string) {
    const marker = this.routes.get(technicianId);
    if (marker && this.map) {
      this.map.removeObject(marker);
      this.routes.delete(technicianId);
    }
  }

  async displayRoute(routeId: string) {
    if (!this.map) return;

    try {
      const route = await this.getRoute(routeId);
      
      // Clear existing objects
      this.map.removeObjects(this.map.getObjects());

      // Add start marker
      const startMarker = new H.map.Marker({
        lat: route.start_location.lat,
        lng: route.start_location.lng
      }, {
        icon: new H.map.Icon('path/to/start-marker.svg')
      });
      this.map.addObject(startMarker);

      // Add stop markers
      route.stops.forEach((stop: any) => {
        const marker = new H.map.Marker({
          lat: stop.location.lat,
          lng: stop.location.lng
        }, {
          icon: new H.map.Icon('path/to/stop-marker.svg')
        });
        this.map.addObject(marker);
      });

      // Add end marker
      const endMarker = new H.map.Marker({
        lat: route.end_location.lat,
        lng: route.end_location.lng
      }, {
        icon: new H.map.Icon('path/to/end-marker.svg')
      });
      this.map.addObject(endMarker);

      // Calculate and display route
      const routeResult = await this.calculateRoute([
        route.start_location,
        ...route.stops.map((stop: any) => stop.location),
        route.end_location
      ]);

      const lineString = new H.geo.LineString();
      routeResult.shape.forEach((point: string) => {
        const [lat, lng] = point.split(',');
        lineString.pushPoint({ lat: parseFloat(lat), lng: parseFloat(lng) });
      });

      const polyline = new H.map.Polyline(lineString, {
        style: {
          lineWidth: 4,
          strokeColor: '#0077be'
        }
      });
      this.map.addObject(polyline);

      // Set viewport to include entire route
      this.map.getViewModel().setLookAtData({
        bounds: polyline.getBoundingBox()
      });
    } catch (error) {
      console.error('Error displaying route:', error);
      throw error;
    }
  }

  destroy() {
    // Stop all technician tracking
    this.technicians.forEach((channel, technicianId) => {
      this.stopTechnicianTracking(technicianId);
    });

    // Dispose of map instance
    if (this.map) {
      this.map.dispose();
      this.map = null;
    }
  }
}

export const routeService = new RouteService();