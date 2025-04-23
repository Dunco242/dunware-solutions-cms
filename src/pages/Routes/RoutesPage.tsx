import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { MapPin, Plus, Search, Filter, Calendar, Clock, User, Truck, Navigation, MoreVertical } from 'lucide-react';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { Route, RouteStop } from '../../types';
import { routeService } from '../../services/routes';

const RoutesPage: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      // In a real app, this would check the user's role from Supabase
      setIsAdmin(true); // Mock admin status
    };
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      routeService.initializeMap(mapRef.current);

      // Start tracking technicians if admin
      if (isAdmin) {
        routes.forEach(route => {
          routeService.startTechnicianTracking(route.assignedTo.id);
        });
      } else {
        // Only track current technician
        const currentTechnicianId = '1'; // This would come from auth
        routeService.startTechnicianTracking(currentTechnicianId);
      }
    }

    return () => {
      routeService.destroy();
    };
  }, [isAdmin]);

  // Mock data
  const routes: Route[] = [
    {
      id: '1',
      name: 'Downtown Service Route',
      description: 'Commercial clients in downtown area',
      startLocation: {
        lat: 40.7128,
        lng: -74.0060,
        address: '123 Business Ave, New York, NY',
        type: 'business',
        accessNotes: 'Park in loading zone'
      },
      endLocation: {
        lat: 40.7580,
        lng: -73.9855,
        address: '456 Commerce St, New York, NY',
        type: 'business',
        accessNotes: 'Security check required'
      },
      stops: [
        {
          id: '1',
          location: {
            lat: 40.7489,
            lng: -73.9680,
            address: '789 Client Way, New York, NY',
            type: 'business'
          },
          order: 1,
          estimatedTime: '09:00',
          status: 'pending',
          serviceType: 'Maintenance',
          duration: 60,
          customer: {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john@example.com',
            phone: '555-0123',
            company: {} as any,
            title: 'Manager',
            status: 'active',
            source: 'referral',
            assignedTo: {} as any,
            lastContactedAt: '2025-04-22',
            tags: ['vip'],
            customFields: {},
            createdAt: '2025-01-01',
            updatedAt: '2025-04-22'
          },
          notes: ['Check all equipment']
        }
      ],
      status: 'in-progress',
      assignedTo: {
        id: '1',
        name: 'Mike Wilson',
        email: 'mike@example.com',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
        role: 'technician',
        permissions: []
      },
      date: '2025-04-23',
      optimizationStatus: 'optimized',
      estimatedDuration: 240,
      distance: 15.5,
      analytics: {
        efficiency: 85,
        onTimePerformance: 92,
        fuelConsumption: 12.5,
        customerSatisfaction: 4.8,
        delays: {
          count: 1,
          averageDuration: 15,
          reasons: {
            'traffic': 1
          }
        }
      }
    }
  ];

  useEffect(() => {
    if (selectedRoute) {
      const route = routes.find(r => r.id === selectedRoute);
      if (route) {
        const stops = [
          route.startLocation,
          ...route.stops.map(stop => stop.location),
          route.endLocation
        ];
        routeService.calculateRoute(stops);
      }
    }
  }, [selectedRoute]);

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Route Management</h1>
          <p className="mt-1 text-gray-600">Plan and optimize service routes</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button>
            <Plus size={16} className="mr-2" />
            New Route
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routes List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="border-b border-gray-200">
              <div className="space-y-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search routes..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" fullWidth>
                    <Calendar size={16} className="mr-2" />
                    Today
                  </Button>
                  <Button variant="outline" size="sm" fullWidth>
                    <Filter size={16} className="mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <div className="divide-y divide-gray-200">
              {routes.map(route => (
                <div
                  key={route.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedRoute === route.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedRoute(route.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{route.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      route.status === 'completed' ? 'bg-green-100 text-green-800' :
                      route.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2" />
                      {new Date(route.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-2" />
                      {Math.floor(route.estimatedDuration / 60)}h {route.estimatedDuration % 60}m
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-2" />
                      {route.stops.length} stops
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar
                        src={route.assignedTo.avatar}
                        alt={route.assignedTo.name}
                        size="sm"
                      />
                      <span className="ml-2 text-sm text-gray-600">{route.assignedTo.name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Truck size={14} className="mr-1" />
                      {route.distance} mi
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Map and Route Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Live Tracking</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {isAdmin ? 'Monitor all technicians' : 'View your route and location'}
                  </p>
                </div>
                {selectedRoute && (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Navigation size={16} className="mr-2" />
                      Optimize
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <div className="relative">
              {/* HERE Maps container */}
              <div 
                ref={mapRef}
                className="h-[600px] w-full"
              />

              {selectedRoute && (
                <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
                  <h3 className="font-medium text-gray-900 mb-2">Route Analytics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Efficiency</p>
                      <p className="text-lg font-medium text-gray-900">
                        {routes.find(r => r.id === selectedRoute)?.analytics.efficiency}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">On-Time</p>
                      <p className="text-lg font-medium text-gray-900">
                        {routes.find(r => r.id === selectedRoute)?.analytics.onTimePerformance}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoutesPage;