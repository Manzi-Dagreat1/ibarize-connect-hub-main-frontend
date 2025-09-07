import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Phone, MessageCircle, User, Star, Heart, Filter, ArrowRight, Play, Award, Users, CheckCircle, TrendingUp, Bed, Bath, Square, Building, Home, Eye, Plus, Save, X, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiService, Property } from "@/services/api";
import MediaGallery from "@/components/MediaGallery";
import heroBanner from "@/assets/hero-banner.jpg";
import apartmentLuxury from "@/assets/apartment-luxury.jpg";
import houseModern from "@/assets/house-modern.jpg";
import commercialOffice from "@/assets/commercial-office.jpg";

const Index = () => {
  const [searchType, setSearchType] = useState("buy");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showPropertyManagement, setShowPropertyManagement] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [propertyFormData, setPropertyFormData] = useState({
    title: "",
    price: "",
    location: "",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    size: "",
    description: "",
    images: [] as string[],
    videos: [] as string[],
    amenities: [] as string[],
    featured: false,
    status: "active" as const,
    virtualTour: "",
    yearBuilt: new Date().getFullYear(),
    parking: 0,
    floor: 1,
    furnished: false,
    petFriendly: false,
    garden: false,
    balcony: false,
    securitySystem: false,
    nearbyFacilities: [] as string[]
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(true);
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Load properties from API
    const loadProperties = async () => {
      try {
        const data = await apiService.getProperties();
        setProperties(data);
      } catch (error) {
        console.error("Failed to load properties:", error);
        // Fallback to sample data if API fails
        setProperties([
          {
            id: "1",
            title: "Luxury Apartment in City Center",
            price: "RWF 180,000",
            location: "Kicukiro, Kigali",
            bedrooms: 3,
            bathrooms: 2,
            size: "120 sqm",
            type: "apartment",
            description: "Beautiful luxury apartment with modern amenities",
            images: [apartmentLuxury],
            videos: [],
            amenities: ["Air Conditioning", "WiFi", "Parking", "Security"],
            featured: true,
            status: "active" as const,
            virtualTour: "",
            yearBuilt: 2023,
            parking: 2,
            floor: 5,
            furnished: true,
            petFriendly: false,
            garden: false,
            balcony: true,
            securitySystem: true,
            nearbyFacilities: ["School", "Shopping Mall", "Public Transport"],
            createdAt: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  // Load property draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem("propertyDraft");
    if (savedDraft) {
      setPropertyFormData(JSON.parse(savedDraft));
    }
  }, []);

  // Autosave property form data to localStorage (for draft)
  useEffect(() => {
    localStorage.setItem("propertyDraft", JSON.stringify(propertyFormData));
  }, [propertyFormData]);



  const toggleFavorite = (propertyId: number) => {
    const stringId = propertyId.toString();
    const newFavorites = favorites.includes(stringId)
      ? favorites.filter(id => id !== stringId)
      : [...favorites, stringId];
    
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const handleWhatsAppContact = () => {
    window.open("https://wa.me/250780429006", "_blank");
  };

  const handlePropertyFormChange = (field: string, value: any) => {
    setPropertyFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProperty = async () => {
    if (!propertyFormData.title || !propertyFormData.price || !propertyFormData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (title, price, location).",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      await apiService.createProperty(propertyFormData);
      toast({
        title: "Property Saved",
        description: "Your property has been saved successfully!"
      });

      // Clear draft after saving
      localStorage.removeItem("propertyDraft");
      setPropertyFormData({
        title: "",
        price: "",
        location: "",
        type: "apartment",
        bedrooms: 1,
        bathrooms: 1,
        size: "",
        description: "",
        images: [],
        videos: [],
        amenities: [],
        featured: false,
        status: "active" as const,
        virtualTour: "",
        yearBuilt: new Date().getFullYear(),
        parking: 0,
        floor: 1,
        furnished: false,
        petFriendly: false,
        garden: false,
        balcony: false,
        securitySystem: false,
        nearbyFacilities: []
      });

      // Refresh properties list
      const updatedProperties = await apiService.getProperties();
      setProperties(updatedProperties);
    } catch (error) {
      console.error("Failed to save property:", error);
      toast({
        title: "Error",
        description: "Failed to save property. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem("propertyDraft");
    setPropertyFormData({
      title: "",
      price: "",
      location: "",
      type: "apartment",
      bedrooms: 1,
      bathrooms: 1,
      size: "",
      description: "",
      images: [],
      videos: [],
      amenities: [],
      featured: false,
      status: "active" as const,
      virtualTour: "",
      yearBuilt: new Date().getFullYear(),
      parking: 0,
      floor: 1,
      furnished: false,
      petFriendly: false,
      garden: false,
      balcony: false,
      securitySystem: false,
      nearbyFacilities: []
    });
    toast({
      title: "Draft Cleared",
      description: "Property draft has been cleared."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">IBARIZE REAL ESTATE</h1>
              <p className="text-sm opacity-90 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                KICUKIRO CENTER - Behind Bank BPR
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                +250 780 429 006
              </div>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <User className="h-4 w-4 mr-2" />
                Broker Login
              </Button>
              <Button 
                onClick={handleWhatsAppContact}
                className="bg-secondary hover:bg-secondary-hover text-secondary-foreground"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[700px] bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${heroBanner})` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className={`relative container mx-auto px-4 h-full flex items-center transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="max-w-4xl text-white">
            <Badge className="mb-6 bg-primary/20 text-primary-foreground border-primary/30 backdrop-blur-sm">
              <Award className="h-4 w-4 mr-2" />
              #1 Trusted Real Estate in Kigali
            </Badge>
            
            <h2 className="text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
              Find Your Perfect Property in Kigali
            </h2>
            <p className="text-xl lg:text-2xl mb-8 opacity-90 max-w-2xl">
              Professional real estate services with instant broker connection. Discover luxury living in Rwanda's capital.
            </p>

            {/* Enhanced Search Form */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-primary">Search Properties</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-primary border-primary"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="h-14 text-primary text-lg">
                    <Building className="h-5 w-5 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">🏠 Buy Property</SelectItem>
                    <SelectItem value="rent">🔑 Rent Property</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="h-14 text-primary text-lg">
                    <MapPin className="h-5 w-5 mr-2" />
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kicukiro">📍 Kicukiro</SelectItem>
                    <SelectItem value="nyarutarama">🏡 Nyarutarama</SelectItem>
                    <SelectItem value="kimihurura">🌟 Kimihurura</SelectItem>
                    <SelectItem value="remera">🏢 Remera</SelectItem>
                    <SelectItem value="gasabo">🏘️ Gasabo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-14 text-primary text-lg">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-100k">💰 RWF 0 - RWF 100,000</SelectItem>
                    <SelectItem value="100k-300k">💎 RWF 100,000 - RWF 300,000</SelectItem>
                    <SelectItem value="300k-500k">🏆 RWF 300,000 - RWF 500,000</SelectItem>
                    <SelectItem value="500k+">👑 RWF 500,000+</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="h-14 bg-gradient-to-r from-accent to-accent-hover text-accent-foreground font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all">
                  <Search className="h-5 w-5 mr-2" />
                  Search Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>

              {showFilters && (
                <div className="border-t pt-6 mt-6 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select>
                      <SelectTrigger className="h-12">
                        <Bed className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Bedrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bedroom</SelectItem>
                        <SelectItem value="2">2 Bedrooms</SelectItem>
                        <SelectItem value="3">3 Bedrooms</SelectItem>
                        <SelectItem value="4+">4+ Bedrooms</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select>
                      <SelectTrigger className="h-12">
                        <Bath className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Bathrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bathroom</SelectItem>
                        <SelectItem value="2">2 Bathrooms</SelectItem>
                        <SelectItem value="3+">3+ Bathrooms</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="h-12">
                        <Square className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Property Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Under 100 sqm</SelectItem>
                        <SelectItem value="medium">100-200 sqm</SelectItem>
                        <SelectItem value="large">200+ sqm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
                <span>🔥 50+ properties available</span>
                <span>✨ Updated daily</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="absolute bottom-8 right-8">
          <Button
            size="lg"
            onClick={handleWhatsAppContact}
            className="rounded-full w-16 h-16 bg-secondary hover:bg-secondary-hover shadow-2xl animate-bounce"
          >
            <MessageCircle className="h-8 w-8" />
          </Button>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">Featured Properties</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked selection of premium properties in prime Kigali locations
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading properties...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <Card
                  key={property.id}
                  className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-b from-card to-card/95 cursor-pointer overflow-hidden hover:-translate-y-2 transform"
                  onClick={() => navigate(`/property/${property.id}`)}
                >
                  <div className="relative overflow-hidden">
                    <MediaGallery
                      images={property.images || []}
                      videos={property.videos || []}
                      title={property.title}
                      className="w-full h-64"
                    />

                    {/* Overlay with interactive elements */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 text-primary hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/property/${property.id}`);
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Virtual Tour
                        </Button>
                      </div>
                    </div>

                    {/* Top badges and actions */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      <div className="flex gap-2">
                        {property.featured && (
                          <Badge className="bg-gradient-to-r from-accent to-accent-hover text-accent-foreground shadow-lg animate-pulse">
                            ⭐ Featured
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-white/90 text-primary capitalize">
                          {property.type}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`w-10 h-10 rounded-full bg-white/90 hover:bg-white transition-all ${
                            favorites.includes(property.id) ? 'text-red-500' : 'text-gray-600'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(parseInt(property.id));
                          }}
                        >
                          <Heart className={`h-4 w-4 ${favorites.includes(property.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    {/* Price badge */}
                    <div className="absolute bottom-3 right-3">
                      <div className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                        {property.price}
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <h4 className="font-bold text-xl text-primary group-hover:text-accent transition-colors line-clamp-2">
                      {property.title}
                    </h4>
                    <p className="text-muted-foreground flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-accent" />
                      {property.location}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Bed className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{property.bedrooms}</span>
                        <span className="text-xs text-muted-foreground">Beds</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Bath className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{property.bathrooms}</span>
                        <span className="text-xs text-muted-foreground">Baths</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Square className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{property.size}</span>
                        <span className="text-xs text-muted-foreground">Size</span>
                      </div>
                    </div>

                    {/* Amenities Preview */}
                    {property.amenities && property.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {property.amenities.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {property.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Additional Features */}
                    <div className="flex gap-2 text-xs">
                      {property.furnished && (
                        <Badge variant="secondary" className="bg-green-50 text-green-700">
                          Furnished
                        </Badge>
                      )}
                      {property.petFriendly && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          Pet Friendly
                        </Badge>
                      )}
                      {property.garden && (
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                          Garden
                        </Badge>
                      )}
                      {property.balcony && (
                        <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                          Balcony
                        </Badge>
                      )}
                    </div>

                    {/* Property stats */}
                    <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{Math.floor(Math.random() * 200) + 50} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{Math.floor(Math.random() * 30) + 5} saved</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all transform hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/property/${property.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWhatsAppContact();
                      }}
                      className="flex-1 bg-gradient-to-r from-secondary to-secondary-hover text-secondary-foreground transform hover:scale-105 transition-all"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Property Management Section */}
      <section className="py-16 bg-gradient-to-br from-muted/50 to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">Property Management</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Add and manage your properties with automatic saving. Your drafts are saved locally for convenience.
            </p>
            <Button
              onClick={() => setShowPropertyManagement(!showPropertyManagement)}
              className="bg-gradient-to-r from-primary to-primary-hover hover:shadow-lg transform hover:scale-105 transition-all"
            >
              {showPropertyManagement ? (
                <>
                  <X className="h-5 w-5 mr-2" />
                  Hide Property Form
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Property
                </>
              )}
            </Button>
          </div>

          {showPropertyManagement && (
            <Card className="max-w-4xl mx-auto border-2 border-primary/20 shadow-2xl bg-gradient-to-b from-card to-card/95">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
                <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  Add New Property
                </CardTitle>
                <p className="text-muted-foreground">Fill in the details below. Your progress is automatically saved.</p>
              </CardHeader>
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="property-title" className="text-sm font-medium">Property Title *</Label>
                      <Input
                        id="property-title"
                        value={propertyFormData.title}
                        onChange={(e) => handlePropertyFormChange("title", e.target.value)}
                        placeholder="e.g., Luxury Apartment in City Center"
                        className="h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="property-price" className="text-sm font-medium">Price *</Label>
                      <Input
                        id="property-price"
                        value={propertyFormData.price}
                        onChange={(e) => handlePropertyFormChange("price", e.target.value)}
                        placeholder="e.g., RWF 180,000 or RWF 1,200/month"
                        className="h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="property-location" className="text-sm font-medium">Location *</Label>
                      <Input
                        id="property-location"
                        value={propertyFormData.location}
                        onChange={(e) => handlePropertyFormChange("location", e.target.value)}
                        placeholder="e.g., Kicukiro, Kigali"
                        className="h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="property-type" className="text-sm font-medium">Property Type *</Label>
                      <Select value={propertyFormData.type} onValueChange={(value) => handlePropertyFormChange("type", value)}>
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="property-bedrooms" className="text-sm font-medium">Bedrooms</Label>
                      <Input
                        id="property-bedrooms"
                        type="number"
                        min="0"
                        max="20"
                        value={propertyFormData.bedrooms}
                        onChange={(e) => handlePropertyFormChange("bedrooms", parseInt(e.target.value) || 0)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="property-bathrooms" className="text-sm font-medium">Bathrooms</Label>
                      <Input
                        id="property-bathrooms"
                        type="number"
                        min="0"
                        max="20"
                        value={propertyFormData.bathrooms}
                        onChange={(e) => handlePropertyFormChange("bathrooms", parseInt(e.target.value) || 0)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="property-size" className="text-sm font-medium">Size</Label>
                      <Input
                        id="property-size"
                        value={propertyFormData.size}
                        onChange={(e) => handlePropertyFormChange("size", e.target.value)}
                        placeholder="e.g., 120 sqm"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Auto-Save Status</Label>
                      <div className="h-12 flex items-center">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Save className="h-3 w-3 mr-1" />
                          Auto-Saved
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="property-description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="property-description"
                      value={propertyFormData.description}
                      onChange={(e) => handlePropertyFormChange("description", e.target.value)}
                      placeholder="Describe the property features, location benefits, and unique selling points..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-6 border-t">
                    <Button
                      type="button"
                      onClick={handleSaveProperty}
                      disabled={saving}
                      className="flex-1 h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary-hover hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5 mr-2" />
                      )}
                      {saving ? "Saving..." : "Save Property"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearDraft}
                      className="px-8 h-12 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Draft
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-accent mb-2">50+</div>
              <div className="text-lg">Properties Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">100+</div>
              <div className="text-lg">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">5★</div>
              <div className="text-lg">Client Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-accent to-accent-hover">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-accent-foreground mb-4">
            Ready to Find Your Dream Property?
          </h3>
          <p className="text-xl text-accent-foreground/90 mb-8">
            Contact our professional brokers today for personalized service
          </p>
          <Button 
            size="lg"
            onClick={handleWhatsAppContact}
            className="bg-primary hover:bg-primary-hover text-primary-foreground text-lg px-8 py-4"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Start WhatsApp Chat Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">IBARIZE REAL ESTATE</h4>
              <p className="opacity-90">
                Your trusted partner for premium real estate in Kigali
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Contact Info</h5>
              <div className="space-y-2 text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  KICUKIRO CENTER - Behind Bank BPR
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  +250 780 429 006
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Services</h5>
              <ul className="space-y-1 text-sm opacity-90">
                <li>Property Sales</li>
                <li>Property Rentals</li>
                <li>Commercial Real Estate</li>
                <li>Property Management</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-75">
            &copy; 2024 IBARIZE REAL ESTATE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;