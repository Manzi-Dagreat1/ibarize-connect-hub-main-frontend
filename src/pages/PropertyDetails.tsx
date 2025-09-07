import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, MessageCircle, Heart, Share2, Bed, Bath, Square, Calendar, Car, Building, Wifi, Shield, PawPrint, TreePine, Wind, Zap, Home, Eye, Play, Star, CheckCircle, Award, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiService, Property } from "@/services/api";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL;
  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;

      try {
        const propertyData = await apiService.getProperty(id);
        setProperty(propertyData);
      } catch (error) {
        console.error("Failed to load property:", error);
        // Fallback to sample data if API fails
        setProperty({
          id: id,
          title: "Luxury Apartment in City Center",
          price: "RWF 180,000",
          location: "Kicukiro, Kigali",
          bedrooms: 3,
          bathrooms: 2,
          size: "120 sqm",
          type: "apartment",
          description: "Beautiful luxury apartment with modern amenities and stunning city views. This spacious 3-bedroom apartment features high-end finishes, premium appliances, and is located in the heart of Kigali's most desirable neighborhood.",
          images: ["/api/placeholder/800/600"],
          videos: [],
          amenities: ["Air Conditioning", "Heating", "WiFi", "Swimming Pool", "Gym", "Elevator", "Balcony", "Garden", "Parking", "Security", "Laundry", "Kitchen Appliances"],
          featured: true,
          status: "active",
          virtualTour: "https://example.com/virtual-tour",
          yearBuilt: 2023,
          parking: 2,
          floor: 5,
          furnished: true,
          petFriendly: true,
          garden: false,
          balcony: true,
          securitySystem: true,
          nearbyFacilities: ["School", "Hospital", "Shopping Mall", "Public Transport", "Restaurant", "Bank", "Pharmacy", "Park"],
          createdAt: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    loadProperty();
  }, [id]);

  const toggleFavorite = () => {
    if (!property) return;

    const newFavorites = favorites.includes(property.id)
      ? favorites.filter(favId => favId !== property.id)
      : [...favorites, property.id];

    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const handleWhatsAppContact = () => {
    const message = `Hi! I'm interested in this property: ${property?.title} located at ${property?.location}. Price: ${property?.price}`;
    window.open(`https://wa.me/250780429006?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out this property: ${property?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  const nextImage = () => {
    if (!property?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    if (!property?.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Property Not Found</h2>
          <p className="text-muted-foreground mb-6">The property you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const amenityIcons: { [key: string]: any } = {
    "Air Conditioning": Wind,
    "Heating": Zap,
    "WiFi": Wifi,
    "Swimming Pool": Home,
    "Gym": Users,
    "Elevator": Building,
    "Balcony": Home,
    "Garden": TreePine,
    "Parking": Car,
    "Security": Shield,
    "Laundry": Home,
    "Kitchen Appliances": Home,
    "Furnished": Home,
    "Pet Friendly": PawPrint
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">IBARIZE REAL ESTATE</h1>
                <p className="text-sm opacity-90">Property Details</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className={`text-primary-foreground hover:bg-primary-foreground/20 ${
                  favorites.includes(property.id) ? 'text-red-400' : ''
                }`}
              >
                <Heart className={`h-4 w-4 mr-2 ${favorites.includes(property.id) ? 'fill-current' : ''}`} />
                {favorites.includes(property.id) ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleWhatsAppContact}
                className="bg-secondary hover:bg-secondary-hover text-secondary-foreground"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Agent
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                {property.images && property.images.length > 0 ? (
                  <>
                    <img
                      src={`${API_BASE_URL+property.images[currentImageIndex]}`}
                      alt={property.title}
                      className="w-full h-96 object-cover"
                    />
                    {property.images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                          onClick={prevImage}
                        >
                          ‹
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                          onClick={nextImage}
                        >
                          ›
                        </Button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {property.images.map((_, index) => (
                            <button
                              key={index}
                              className={`w-2 h-2 rounded-full ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-96 bg-muted flex items-center justify-center">
                    <Home className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {property.featured && (
                    <Badge className="bg-accent text-accent-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-white/90 text-primary capitalize">
                    {property.type}
                  </Badge>
                  <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                    {property.status}
                  </Badge>
                </div>

                {/* Price */}
                <div className="absolute top-4 right-4">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xl font-bold shadow-lg">
                    {property.price}
                  </div>
                </div>
              </div>
            </Card>

            {/* Property Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-primary">{property.title}</CardTitle>
                    <p className="text-muted-foreground flex items-center gap-2 mt-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      {property.location}
                    </p>
                  </div>
                  {property.virtualTour && (
                    <Button
                      variant="outline"
                      onClick={() => setShowVirtualTour(!showVirtualTour)}
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Virtual Tour
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Bed className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">{property.bedrooms}</div>
                    <div className="text-sm text-muted-foreground">Bedrooms</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Bath className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">{property.bathrooms}</div>
                    <div className="text-sm text-muted-foreground">Bathrooms</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Square className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">{property.size}</div>
                    <div className="text-sm text-muted-foreground">Size</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Car className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary">{property.parking}</div>
                    <div className="text-sm text-muted-foreground">Parking</div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Year Built:</span>
                    <p className="text-muted-foreground">{property.yearBuilt}</p>
                  </div>
                  <div>
                    <span className="font-medium">Floor:</span>
                    <p className="text-muted-foreground">{property.floor}</p>
                  </div>
                  <div>
                    <span className="font-medium">Furnished:</span>
                    <p className="text-muted-foreground">{property.furnished ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Pet Friendly:</span>
                    <p className="text-muted-foreground">{property.petFriendly ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Amenities & Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {property.amenities.map((amenity) => {
                        const IconComponent = amenityIcons[amenity] || Home;
                        return (
                          <div key={amenity} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                            <IconComponent className="h-4 w-4 text-primary" />
                            <span className="text-sm">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Nearby Facilities */}
                {property.nearbyFacilities && property.nearbyFacilities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Nearby Facilities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {property.nearbyFacilities.map((facility) => (
                        <div key={facility} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{facility}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Additional Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {property.garden && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                        <TreePine className="h-4 w-4" />
                        <span className="text-sm">Garden</span>
                      </div>
                    )}
                    {property.balcony && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg">
                        <Home className="h-4 w-4" />
                        <span className="text-sm">Balcony</span>
                      </div>
                    )}
                    {property.securitySystem && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm">Security System</span>
                      </div>
                    )}
                    {property.furnished && (
                      <div className="flex items-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg">
                        <Home className="h-4 w-4" />
                        <span className="text-sm">Furnished</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Videos */}
            {property.videos && property.videos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Property Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.videos.map((video, index) => (
                      <div key={index} className="relative">
                        <video
                          src={`${API_BASE_URL+video}`}
                          controls
                          className="w-full h-48 object-cover rounded-lg"
                          poster={property.images && property.images[0] ? `${API_BASE_URL+property.images[0]}` : undefined}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Contact Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold">IBARIZE REAL ESTATE</h4>
                  <p className="text-sm text-muted-foreground">Professional Broker</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>+250 780 429 006</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>KICUKIRO CENTER</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    <span>Licensed & Verified</span>
                  </div>
                </div>

                <Button
                  onClick={handleWhatsAppContact}
                  className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground"
                  size="lg"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp Now
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`tel:+250780429006`)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Directly
                </Button>
              </CardContent>
            </Card>

            {/* Property Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-sm">Views</span>
                  </div>
                  <span className="font-semibold">{Math.floor(Math.random() * 500) + 100}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Saved</span>
                  </div>
                  <span className="font-semibold">{Math.floor(Math.random() * 50) + 10}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Interest</span>
                  </div>
                  <span className="font-semibold">High</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
