import { useState, useEffect, useMemo } from "react";
import { Plus, Upload, Edit, Trash2, Users, BarChart3, Settings, LogOut, Home, Search, Filter, X, Tag, Calendar, Download, Upload as UploadIcon, Eye, EyeOff, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { apiService } from "@/services/api";
import MediaGallery from "@/components/MediaGallery";

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  size: string;
  type: string;
  description: string;
  images: string[];
  videos: string[];
  amenities: string[];
  featured: boolean;
  status: 'active' | 'pending' | 'sold';
  virtualTour: string;
  yearBuilt: number;
  parking: number;
  floor: number;
  furnished: boolean;
  petFriendly: boolean;
  garden: boolean;
  balcony: boolean;
  securitySystem: boolean;
  nearbyFacilities: string[];
  createdAt: string;
}

const Dashboard = () => {
  const [currentSection, setCurrentSection] = useState("overview");
  const [properties, setProperties] = useState<Property[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [settings, setSettings] = useState({
    brokerName: "IBARIZE REAL ESTATE",
    contactPhone: "+250 780 429 006",
    email: "broker@ibarize.com",
    location: "KICUKIRO CENTER - Behind Bank BPR",
    bio: "",
    notifications: {
      newInquiries: true,
      weeklyReports: true,
      propertyViews: false,
      systemUpdates: true
    },
    display: {
      theme: "light",
      language: "en",
      currency: "rwf"
    }
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const { toast } = useToast();

  // New state variables for enhanced functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    featured: "",
    furnished: "",
    petFriendly: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [propertyCategories, setPropertyCategories] = useState<string[]>(["Residential", "Commercial", "Land", "Investment"]);
  const [propertyTags, setPropertyTags] = useState<string[]>(["Luxury", "Affordable", "New Construction", "Renovated", "Waterfront", "Mountain View"]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonProperties, setComparisonProperties] = useState<Property[]>([]);
  const [showScheduling, setShowScheduling] = useState(false);
  const [schedulingProperty, setSchedulingProperty] = useState<Property | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyProperty, setHistoryProperty] = useState<Property | null>(null);
  const [propertyTemplates, setPropertyTemplates] = useState<Property[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Load properties and analytics from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesData, analyticsData] = await Promise.all([
          apiService.getProperties(),
          apiService.getAnalytics()
        ]);
        setProperties(propertiesData);
        setAnalytics(analyticsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data from server.",
          variant: "destructive"
        });
      }
    };
    fetchData();
  }, []);

  // Filtered properties based on search and filters
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          property.title.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query) ||
          property.description.toLowerCase().includes(query) ||
          property.type.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Filters
      if (filters.type && property.type !== filters.type) return false;
      if (filters.status && property.status !== filters.status) return false;
      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) return false;

      // Price filters
      if (filters.minPrice) {
        const minPrice = parseFloat(filters.minPrice.replace(/[^\d.]/g, ''));
        const propertyPrice = parseFloat(property.price.replace(/[^\d.]/g, ''));
        if (propertyPrice < minPrice) return false;
      }
      if (filters.maxPrice) {
        const maxPrice = parseFloat(filters.maxPrice.replace(/[^\d.]/g, ''));
        const propertyPrice = parseFloat(property.price.replace(/[^\d.]/g, ''));
        if (propertyPrice > maxPrice) return false;
      }

      // Numeric filters
      if (filters.bedrooms && property.bedrooms !== parseInt(filters.bedrooms)) return false;
      if (filters.bathrooms && property.bathrooms !== parseInt(filters.bathrooms)) return false;

      // Boolean filters
      if (filters.featured && property.featured !== (filters.featured === 'true')) return false;
      if (filters.furnished && property.furnished !== (filters.furnished === 'true')) return false;
      if (filters.petFriendly && property.petFriendly !== (filters.petFriendly === 'true')) return false;

      return true;
    });
  }, [properties, searchQuery, filters]);

  // Save properties to backend API
  const saveProperties = async (updatedProperties: Property[]) => {
    setProperties(updatedProperties);
  };

  const handleAddProperty = async (propertyData: Omit<Property, "id" | "createdAt">) => {
    try {
      const response = await apiService.createProperty(propertyData);
      const newProperty: Property = { ...propertyData, id: response.id, createdAt: new Date().toISOString() };
      const updatedProperties = [...properties, newProperty];
      setProperties(updatedProperties);
      setShowAddProperty(false);
      toast({
        title: "Success",
        description: "Property added successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add property.",
        variant: "destructive"
      });
    }
  };

  const handleEditProperty = async (propertyData: Omit<Property, "id" | "createdAt">) => {
    if (!editingProperty) return;
    try {
      await apiService.updateProperty(editingProperty.id, propertyData);
      const updatedProperties = properties.map(p =>
        p.id === editingProperty.id
          ? { ...propertyData, id: editingProperty.id, createdAt: editingProperty.createdAt }
          : p
      );
      setProperties(updatedProperties);
      setEditingProperty(null);
      toast({
        title: "Success",
        description: "Property updated successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update property.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      await apiService.deleteProperty(id);
      const updatedProperties = properties.filter(p => p.id !== id);
      setProperties(updatedProperties);
      toast({
        title: "Success",
        description: "Property deleted successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await apiService.updateSettings(settings);
      toast({
        title: "Success",
        description: "Settings saved successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive"
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSettingsChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handleDisplayChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [field]: value
      }
    }));
  };

  // New handler functions for enhanced functionality
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      status: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
      featured: "",
      furnished: "",
      petFriendly: ""
    });
    setSearchQuery("");
  };

  const handlePropertySelect = (propertyId: string) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties.map(p => p.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProperties.length === 0) return;

    try {
      switch (action) {
        case 'delete':
          await Promise.all(selectedProperties.map(id => apiService.deleteProperty(id)));
          const updatedProperties = properties.filter(p => !selectedProperties.includes(p.id));
          setProperties(updatedProperties);
          toast({
            title: "Success",
            description: `Deleted ${selectedProperties.length} properties successfully!`
          });
          break;
        case 'status_active':
          await Promise.all(selectedProperties.map(id => apiService.updateProperty(id, { status: 'active' })));
          const activeProperties = properties.map(p =>
            selectedProperties.includes(p.id) ? { ...p, status: 'active' as const } : p
          );
          setProperties(activeProperties);
          toast({
            title: "Success",
            description: `Activated ${selectedProperties.length} properties successfully!`
          });
          break;
        case 'status_pending':
          await Promise.all(selectedProperties.map(id => apiService.updateProperty(id, { status: 'pending' })));
          const pendingProperties = properties.map(p =>
            selectedProperties.includes(p.id) ? { ...p, status: 'pending' as const } : p
          );
          setProperties(pendingProperties);
          toast({
            title: "Success",
            description: `Set ${selectedProperties.length} properties to pending successfully!`
          });
          break;
        case 'status_sold':
          await Promise.all(selectedProperties.map(id => apiService.updateProperty(id, { status: 'sold' })));
          const soldProperties = properties.map(p =>
            selectedProperties.includes(p.id) ? { ...p, status: 'sold' as const } : p
          );
          setProperties(soldProperties);
          toast({
            title: "Success",
            description: `Marked ${selectedProperties.length} properties as sold successfully!`
          });
          break;
      }
      setSelectedProperties([]);
      setBulkAction("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action.",
        variant: "destructive"
      });
    }
  };

  const handleExportProperties = () => {
    const dataStr = JSON.stringify(filteredProperties, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `properties_export_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Success",
      description: "Properties exported successfully!"
    });
  };

  const handleAddToComparison = (property: Property) => {
    if (comparisonProperties.length < 3 && !comparisonProperties.find(p => p.id === property.id)) {
      setComparisonProperties(prev => [...prev, property]);
      toast({
        title: "Added to Comparison",
        description: `${property.title} added to comparison`
      });
    } else if (comparisonProperties.length >= 3) {
      toast({
        title: "Comparison Limit Reached",
        description: "You can compare up to 3 properties at once",
        variant: "destructive"
      });
    }
  };

  const removeFromComparison = (propertyId: string) => {
    setComparisonProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  const clearComparison = () => {
    setComparisonProperties([]);
  };

  const PropertyForm = ({ 
    property, 
    onSubmit, 
    onCancel 
  }: { 
    property?: Property; 
    onSubmit: (data: Omit<Property, "id" | "createdAt">) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      title: property?.title || "",
      price: property?.price || "",
      location: property?.location || "",
      bedrooms: property?.bedrooms || 1,
      bathrooms: property?.bathrooms || 1,
      size: property?.size || "",
      type: property?.type || "apartment",
      description: property?.description || "",
      images: property?.images || [],
      videos: property?.videos || [],
      amenities: property?.amenities || [],
      featured: property?.featured || false,
      status: property?.status || "active" as const,
      virtualTour: property?.virtualTour || "",
      yearBuilt: property?.yearBuilt || new Date().getFullYear(),
      parking: property?.parking || 0,
      floor: property?.floor || 1,
      furnished: property?.furnished || false,
      petFriendly: property?.petFriendly || false,
      garden: property?.garden || false,
      balcony: property?.balcony || false,
      securitySystem: property?.securitySystem || false,
      nearbyFacilities: property?.nearbyFacilities || []
    });

    const amenitiesList = [
      "Air Conditioning", "Heating", "WiFi", "Swimming Pool", "Gym", 
      "Elevator", "Balcony", "Garden", "Parking", "Security", 
      "Laundry", "Kitchen Appliances", "Furnished", "Pet Friendly"
    ];

    const nearbyFacilitiesList = [
      "School", "Hospital", "Shopping Mall", "Public Transport", 
      "Restaurant", "Bank", "Pharmacy", "Park", "Gym", "Airport"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        const propertyData = {
          ...formData,
          price: parseFloat(formData.price) || 0,
          bedrooms: parseInt(formData.bedrooms) || 1,
          bathrooms: parseInt(formData.bathrooms) || 1,
          size: parseFloat(formData.size) || 0,
          yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
          parking: parseInt(formData.parking) || 0,
          floor: parseInt(formData.floor) || 1,
        };
        
        // Validate required fields
        if (!propertyData.title.trim()) {
          toast({
            title: "Validation Error",
            description: "Property title is required.",
            variant: "destructive",
          });
          return;
        }
        
        if (!propertyData.location.trim()) {
          toast({
            title: "Validation Error",
            description: "Property location is required.",
            variant: "destructive",
          });
          return;
        }
        
        if (propertyData.price <= 0) {
          toast({
            title: "Validation Error",
            description: "Please enter a valid price greater than 0.",
            variant: "destructive",
          });
          return;
        }

        const response = await apiService.createProperty(propertyData);
        
        toast({
          title: "Success!",
          description: "Property has been created successfully.",
        });
        
        // Reset form
        setFormData({
          title: '',
          price: '',
          location: '',
          bedrooms: '1',
          bathrooms: '1',
          size: '',
          type: 'apartment',
          description: '',
          images: [],
          videos: [],
          amenities: [],
          featured: false,
          status: 'active',
          virtualTour: '',
          yearBuilt: '',
          parking: '0',
          floor: '1',
          furnished: false,
          petFriendly: false,
          garden: false,
          balcony: false,
          securitySystem: false,
          nearbyFacilities: []
        });
        
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create property. Please try again.",
          variant: "destructive",
        });
      }
    };

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
              <Upload className="h-6 w-6" />
              {property ? "Edit Property" : "Add New Property"}
            </CardTitle>
            <p className="text-muted-foreground">Create stunning property listings with multimedia content</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Property Title *</Label>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Luxury Apartment in City Center"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">Price *</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g., RWF 180,000 or RWF 1,200/month"
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
                    <Input
                      id="location"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Kicukiro, Kigali"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">Property Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">🏢 Apartment</SelectItem>
                        <SelectItem value="house">🏠 House</SelectItem>
                        <SelectItem value="commercial">🏢 Commercial</SelectItem>
                        <SelectItem value="land">🌾 Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Property Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms" className="text-sm font-medium">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      max="20"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 0 }))}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms" className="text-sm font-medium">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="0"
                      max="20"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: parseInt(e.target.value) || 0 }))}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parking" className="text-sm font-medium">Parking Spaces</Label>
                    <Input
                      id="parking"
                      type="number"
                      min="0"
                      value={formData.parking}
                      onChange={(e) => setFormData(prev => ({ ...prev, parking: parseInt(e.target.value) || 0 }))}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor" className="text-sm font-medium">Floor</Label>
                    <Input
                      id="floor"
                      type="number"
                      min="0"
                      value={formData.floor}
                      onChange={(e) => setFormData(prev => ({ ...prev, floor: parseInt(e.target.value) || 1 }))}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="size" className="text-sm font-medium">Size</Label>
                    <Input
                      id="size"
                      value={formData.size}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                      placeholder="e.g., 120 sqm"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearBuilt" className="text-sm font-medium">Year Built</Label>
                    <Input
                      id="yearBuilt"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      value={formData.yearBuilt}
                      onChange={(e) => setFormData(prev => ({ ...prev, yearBuilt: parseInt(e.target.value) || new Date().getFullYear() }))}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Description & Virtual Tour */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Description & Virtual Content</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Property Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the property features, location benefits, and unique selling points..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="virtualTour" className="text-sm font-medium">Virtual Tour URL</Label>
                    <Input
                      id="virtualTour"
                      value={formData.virtualTour}
                      onChange={(e) => setFormData(prev => ({ ...prev, virtualTour: e.target.value }))}
                      placeholder="e.g., https://tour.example.com/property123"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Media Management Note */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Media Management
                </h3>
                <p className="text-sm text-muted-foreground">
                  Media uploads have moved. First save the property, then manage images and videos using the <span className="font-medium">Manage Media</span> action in the property list.
                </p>
              </div>

              {/* Amenities */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {amenitiesList.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`amenity-${amenity}`}
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => setFormData(prev => ({
                          ...prev,
                          amenities: prev.amenities.includes(amenity)
                            ? prev.amenities.filter(a => a !== amenity)
                            : [...prev.amenities, amenity]
                        }))}
                        className="rounded border-primary/30"
                      />
                      <Label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Facilities */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Nearby Facilities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {nearbyFacilitiesList.map((facility) => (
                    <div key={facility} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`facility-${facility}`}
                        checked={formData.nearbyFacilities.includes(facility)}
                        onChange={() => setFormData(prev => ({
                          ...prev,
                          nearbyFacilities: prev.nearbyFacilities.includes(facility)
                            ? prev.nearbyFacilities.filter(f => f !== facility)
                            : [...prev.nearbyFacilities, facility]
                        }))}
                        className="rounded border-primary/30"
                      />
                      <Label htmlFor={`facility-${facility}`} className="text-sm cursor-pointer">
                        {facility}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Features */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Additional Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="furnished"
                      checked={formData.furnished}
                      onChange={(e) => setFormData(prev => ({ ...prev, furnished: e.target.checked }))}
                      className="rounded border-primary/30"
                    />
                    <Label htmlFor="furnished" className="cursor-pointer">Furnished</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="petFriendly"
                      checked={formData.petFriendly}
                      onChange={(e) => setFormData(prev => ({ ...prev, petFriendly: e.target.checked }))}
                      className="rounded border-primary/30"
                    />
                    <Label htmlFor="petFriendly" className="cursor-pointer">Pet Friendly</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="garden"
                      checked={formData.garden}
                      onChange={(e) => setFormData(prev => ({ ...prev, garden: e.target.checked }))}
                      className="rounded border-primary/30"
                    />
                    <Label htmlFor="garden" className="cursor-pointer">Garden</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="balcony"
                      checked={formData.balcony}
                      onChange={(e) => setFormData(prev => ({ ...prev, balcony: e.target.checked }))}
                      className="rounded border-primary/30"
                    />
                    <Label htmlFor="balcony" className="cursor-pointer">Balcony</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="securitySystem"
                      checked={formData.securitySystem}
                      onChange={(e) => setFormData(prev => ({ ...prev, securitySystem: e.target.checked }))}
                      className="rounded border-primary/30"
                    />
                    <Label htmlFor="securitySystem" className="cursor-pointer">Security System</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-primary/30"
                    />
                    <Label htmlFor="featured" className="cursor-pointer">⭐ Featured Property</Label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button 
                  type="submit" 
                  className="flex-1 h-12 text-lg font-medium"
                >
                  {property ? "Update Property" : "Create Property"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  className="px-8 h-12"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold text-primary">{properties.length}</p>
              </div>
              <Home className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold text-secondary">{properties.filter(p => p.status === 'active').length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold text-accent">{properties.filter(p => p.featured).length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inquiries</p>
                <p className="text-2xl font-bold text-destructive">24</p>
              </div>
              <Users className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {properties.slice(0, 3).map((property) => (
              <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{property.title}</h4>
                  <p className="text-sm text-muted-foreground">{property.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                    {property.status}
                  </Badge>
                  <span className="font-semibold text-primary">{property.price}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProperties = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Property Management</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-2"
          >
            <UploadIcon className="h-4 w-4" />
            Import
          </Button>
          <Button
            onClick={() => setShowAddProperty(true)}
            className="bg-primary hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search properties by title, location, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(Object.values(filters).some(v => v !== "") || searchQuery) && (
                  <Badge variant="secondary" className="ml-1">
                    {Object.values(filters).filter(v => v !== "").length + (searchQuery ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              {(Object.values(filters).some(v => v !== "") || searchQuery) && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="Filter by location"
                    value={filters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bedrooms</Label>
                  <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange("bedrooms", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Min Price</Label>
                  <Input
                    placeholder="e.g., 100000"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Price</Label>
                  <Input
                    placeholder="e.g., 500000"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Featured</Label>
                  <Select value={filters.featured} onValueChange={(value) => handleFilterChange("featured", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="true">Featured Only</SelectItem>
                      <SelectItem value="false">Non-Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Furnished</Label>
                  <Select value={filters.furnished} onValueChange={(value) => handleFilterChange("furnished", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="true">Furnished</SelectItem>
                      <SelectItem value="false">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedProperties.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {selectedProperties.length} of {filteredProperties.length} properties selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedProperties.length === filteredProperties.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Choose action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status_active">Mark as Active</SelectItem>
                    <SelectItem value="status_pending">Mark as Pending</SelectItem>
                    <SelectItem value="status_sold">Mark as Sold</SelectItem>
                    <SelectItem value="delete">Delete Selected</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => handleBulkAction(bulkAction)}
                  disabled={!bulkAction}
                  variant="destructive"
                >
                  Apply Action
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Showing {filteredProperties.length} of {properties.length} properties</span>
        <div className="flex gap-2">
          {comparisonProperties.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComparison(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Compare ({comparisonProperties.length})
            </Button>
          )}
        </div>
      </div>

      {showAddProperty && (
        <PropertyForm
          onSubmit={handleAddProperty}
          onCancel={() => setShowAddProperty(false)}
        />
      )}

      {editingProperty && (
        <PropertyForm
          property={editingProperty}
          onSubmit={handleEditProperty}
          onCancel={() => setEditingProperty(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className={`group ${selectedProperties.includes(property.id) ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="p-4">
              {/* Selection Checkbox */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedProperties.includes(property.id)}
                    onChange={() => handlePropertySelect(property.id)}
                    className="rounded border-primary/30"
                  />
                  <span className="text-sm text-muted-foreground">Select</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddToComparison(property)}
                    disabled={comparisonProperties.length >= 3}
                    className="h-8 w-8 p-0"
                    title="Add to comparison"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowScheduling(true)}
                    className="h-8 w-8 p-0"
                    title="Schedule viewing"
                  >
                    <Calendar className="h-3 w-3" />
                  </Button>
                  <Link
                    to={`/properties/${property.id}/media`}
                    className="text-primary hover:underline text-sm font-medium"
                    title="Open media manager for this property"
                  >
                    Manage Media
                  </Link>
                </div>
              </div>

              {property.images.length > 0 && (
                <MediaGallery
                  images={property.images}
                  videos={property.videos}
                  title={property.title}
                  className="w-full h-32 rounded mb-3"
                />
              )}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{property.title}</h4>
                  <div className="flex gap-1">
                    {property.featured && (
                      <Badge className="bg-accent text-accent-foreground text-xs">
                        Featured
                      </Badge>
                    )}
                    <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {property.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{property.location}</p>
                <p className="font-semibold text-primary">{property.price}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span>{property.size}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingProperty(property)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteProperty(property.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Export Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export {filteredProperties.length} properties to JSON file
              </p>
              <div className="flex gap-2">
                <Button onClick={handleExportProperties} className="flex-1">
                  Export
                </Button>
                <Button variant="outline" onClick={() => setShowExportDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Import Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Import properties from JSON file (Coming Soon)
              </p>
              <div className="flex gap-2">
                <Button disabled className="flex-1">
                  Import
                </Button>
                <Button variant="outline" onClick={() => setShowImportDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Property Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Property Comparison</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowComparison(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {comparisonProperties.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No properties selected for comparison
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {comparisonProperties.map((property) => (
                    <Card key={property.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold">{property.title}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromComparison(property.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {property.images.length > 0 && (
                          <img
                            src={`/api/files/${property.images[0]}`}
                            alt={property.title}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                        )}
                        <div className="space-y-2 text-sm">
                          <p><strong>Location:</strong> {property.location}</p>
                          <p><strong>Price:</strong> {property.price}</p>
                          <p><strong>Type:</strong> {property.type}</p>
                          <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
                          <p><strong>Bathrooms:</strong> {property.bathrooms}</p>
                          <p><strong>Size:</strong> {property.size}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {comparisonProperties.length > 0 && (
                <div className="flex justify-center mt-6">
                  <Button variant="outline" onClick={clearComparison}>
                    Clear All
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-primary">{analytics?.totalViews?.toLocaleString() || '0'}</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">WhatsApp Contacts</p>
                <p className="text-2xl font-bold text-secondary">{analytics?.totalContacts?.toLocaleString() || '0'}</p>
                <p className="text-xs text-green-600">+8% from last month</p>
              </div>
              <Users className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-accent">{analytics?.conversionRate || '0%'}</p>
                <p className="text-xs text-green-600">+2.1% from last month</p>
              </div>
              <BarChart3 className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Response Time</p>
                <p className="text-2xl font-bold text-destructive">{analytics?.avgResponseTime || '0h'}</p>
                <p className="text-xs text-red-600">-15min from last month</p>
              </div>
              <Users className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Properties */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {properties.slice(0, 5).map((property, index) => (
              <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{property.title}</h4>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{Math.floor(Math.random() * 500) + 100} views</p>
                  <p className="text-sm text-muted-foreground">{Math.floor(Math.random() * 20) + 5} contacts</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 border-l-4 border-l-primary bg-primary/5 rounded">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div>
                <p className="text-sm font-medium">New property inquiry for "Luxury Apartment"</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 border-l-4 border-l-secondary bg-secondary/5 rounded">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Property "Modern House" received 15 new views</p>
                <p className="text-xs text-muted-foreground">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 border-l-4 border-l-accent bg-accent/5 rounded">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <div>
                <p className="text-sm font-medium">WhatsApp contact from potential buyer</p>
                <p className="text-xs text-muted-foreground">6 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="brokerName">Broker Name</Label>
              <Input
                id="brokerName"
                value={settings.brokerName}
                onChange={(e) => handleSettingsChange("brokerName", e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => handleSettingsChange("contactPhone", e.target.value)}
                className="h-12"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => handleSettingsChange("email", e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Office Location</Label>
              <Input
                id="location"
                value={settings.location}
                onChange={(e) => handleSettingsChange("location", e.target.value)}
                className="h-12"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Business Description</Label>
            <Textarea
              id="bio"
              value={settings.bio}
              onChange={(e) => handleSettingsChange("bio", e.target.value)}
              placeholder="Tell potential clients about your real estate expertise..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Property Inquiries</p>
              <p className="text-sm text-muted-foreground">Get notified when someone contacts you about a property</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.newInquiries}
              onChange={(e) => handleNotificationChange("newInquiries", e.target.checked)}
              className="rounded border-primary/30"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Analytics Report</p>
              <p className="text-sm text-muted-foreground">Receive weekly performance summaries</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.weeklyReports}
              onChange={(e) => handleNotificationChange("weeklyReports", e.target.checked)}
              className="rounded border-primary/30"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Property View Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when properties receive high traffic</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.propertyViews}
              onChange={(e) => handleNotificationChange("propertyViews", e.target.checked)}
              className="rounded border-primary/30"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">System Updates</p>
              <p className="text-sm text-muted-foreground">Stay informed about new features and updates</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.systemUpdates}
              onChange={(e) => handleNotificationChange("systemUpdates", e.target.checked)}
              className="rounded border-primary/30"
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme Preference</Label>
            <Select value={settings.display.theme} onValueChange={(value) => handleDisplayChange("theme", value)}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light Mode</SelectItem>
                <SelectItem value="dark">Dark Mode</SelectItem>
                <SelectItem value="system">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={settings.display.language} onValueChange={(value) => handleDisplayChange("language", value)}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="rw">🇷🇼 Kinyarwanda</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Select value={settings.display.currency} onValueChange={(value) => handleDisplayChange("currency", value)}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="rwf">RWF (FRw)</SelectItem>
                <SelectItem value="eur">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                className="h-12"
              />
            </div>
          </div>
          <Button className="h-12">
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleSaveSettings}
          disabled={savingSettings}
          className="h-12 px-8"
        >
          {savingSettings ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="outline" className="h-12 px-8">
          Reset to Defaults
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">IBARIZE Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-card rounded-lg p-4 h-fit">
            <nav className="space-y-2">
              <button
                onClick={() => setCurrentSection("overview")}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-2 transition-colors ${
                  currentSection === "overview" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Overview
              </button>
              <button
                onClick={() => setCurrentSection("properties")}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-2 transition-colors ${
                  currentSection === "properties" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <Home className="h-4 w-4" />
                Properties
              </button>
              <button
                onClick={() => setCurrentSection("analytics")}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-2 transition-colors ${
                  currentSection === "analytics" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <Users className="h-4 w-4" />
                Analytics
              </button>
              <button
                onClick={() => setCurrentSection("settings")}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-2 transition-colors ${
                  currentSection === "settings" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {currentSection === "overview" && renderOverview()}
            {currentSection === "properties" && renderProperties()}
            {currentSection === "analytics" && renderAnalytics()}
            {currentSection === "settings" && renderSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;