import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Wifi, Wind, Bath, Search, ArrowRight, Building2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useRealtimeData } from "../hooks/useRealtimeData";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import RoutingMachine from "../components/map/RoutingMachine";
import { useAuth } from "../context/AuthContext";
import CheckoutModal from "../components/rooms/CheckoutModal";
import HouseLoading from "../components/shared/HouseLoading";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export function LocationMapModal({ isOpen, onClose, house }: { isOpen: boolean; onClose: () => void; house: any }) {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !house) {
      setUserPosition(null);
      setLocationError(null);
      return;
    }

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationError("Location services are not available in this browser.");
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        const message = error.code === 1
          ? "Location access was denied. You can still view the pinned house location."
          : "Unable to determine your location right now.";
        setLocationError(message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [isOpen, house?.id]);

  if (!isOpen || !house) return null;

  const targetPosition: [number, number] = house?.latitude && house?.longitude
    ? [Number(house.latitude), Number(house.longitude)]
    : [14.5995, 120.9842];
  const center = userPosition ?? targetPosition;
  const hasCoordinates = house?.latitude != null && house?.longitude != null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl rounded-2xl border border-border bg-card p-4 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-['Libre_Baskerville'] text-xl font-bold">{house.name}</h3>
            <p className="text-sm text-muted-foreground">Route from your current location to this boarding house.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-background p-2 text-muted-foreground transition hover:bg-muted"
            aria-label="Close map"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-3 rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          {locationError ? (
            <p>{locationError}</p>
          ) : userPosition ? (
            <p>Your current location is being used to calculate the route.</p>
          ) : (
            <p>Requesting your location to draw the route…</p>
          )}
          {!hasCoordinates && (
            <p className="mt-1 text-xs text-amber-600">This house does not have a pinned location yet. Ask an administrator to set one.</p>
          )}
        </div>

        <div className="h-[420px] w-full overflow-hidden rounded-xl border border-border">
          <MapContainer key={`${house.id}-${targetPosition[0]}-${targetPosition[1]}`} center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {userPosition && (
              <Marker position={userPosition}>
                <Popup>Your current location</Popup>
              </Marker>
            )}
            <Marker position={targetPosition}>
              <Popup>{house.name}</Popup>
            </Marker>
            {userPosition && <RoutingMachine userPos={userPosition} targetPos={targetPosition} />}
          </MapContainer>
        </div>
      </motion.div>
    </div>
  );
}

function RoomCard({ room, group, onApply, tenants }: { room: any, group: any, onApply: (room: any) => void, tenants: any[] }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  const features: string[] = Array.isArray(room.features) ? room.features : ["AC", "Wi-Fi"];
  const hasAC = features.includes("AC") || features.includes("Air Conditioning");
  const hasWifi = features.includes("Wi-Fi") || features.includes("Internet");
  const price = room.price || 5000;
  const images: string[] = Array.isArray(room.images) ? room.images : [];
  const maxOccupants = room.max_occupants || 1;
  const currentOccupants = tenants.filter((t: any) => t.room_id === room.id).length;
  const isFull = currentOccupants >= maxOccupants;

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {images.length > 0 ? (
          <>
            <motion.img 
              key={imgIndex}
              initial={{ opacity: 0.5, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={images[imgIndex]} 
              alt={`Room ${room.number} view ${imgIndex + 1}`} 
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500" 
              onClick={() => setShowGallery(true)}
            />
            {images.length > 1 && (
              <>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={prevImg} className="rounded-full bg-background/80 backdrop-blur p-1.5 text-foreground hover:bg-background transition">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextImg} className="rounded-full bg-background/80 backdrop-blur p-1.5 text-foreground hover:bg-background transition">
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === imgIndex ? "w-4 bg-primary" : "w-1.5 bg-background/60"}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#e6eedb]">
            <span className="font-['Libre_Baskerville'] text-4xl text-primary/20">Room {room.number}</span>
          </div>
        )}
        <div className={`absolute top-4 left-4 rounded-full backdrop-blur px-3 py-1 text-xs font-bold ${isFull ? "bg-red-500/90 text-white" : "bg-background/90 text-emerald-600"}`}>
          {isFull ? `Occupied ${currentOccupants}/${maxOccupants}` : `Available ${currentOccupants}/${maxOccupants}`}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
              <MapPin size={12} /> {group.houseName}
            </p>
            <h3 className="font-['Libre_Baskerville'] text-xl font-bold">Room {room.number}</h3>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-primary">₱{price.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Per Month</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
          {room.description || `A beautiful and spacious room located at ${group.houseName}. Perfect for students or young professionals looking for a comfortable living space.`}
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {hasAC && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wind size={14} className="text-primary" /> AC
            </div>
          )}
          {hasWifi && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wifi size={14} className="text-primary" /> Wi-Fi
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Bath size={14} className="text-primary" /> Private Bath
          </div>
        </div>

        <button 
          onClick={() => onApply(room)}
          disabled={isFull}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all group-hover:gap-3 ${isFull ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-[#173f39]"}`}
        >
          {isFull ? "Room Full" : <>Apply Now <ArrowRight size={16} /></>}
        </button>
      </div>

      <AnimatePresence>
        {showGallery && images.length > 0 && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm">
            <button 
              onClick={() => setShowGallery(false)}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/40 rounded-full p-2 transition"
            >
              <X size={28} />
            </button>
            
            <motion.img
              key={imgIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={images[imgIndex]}
              alt={`Room Preview`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />

            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImg} 
                  className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-3 transition"
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  onClick={nextImg} 
                  className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-3 transition"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
              {images.map((_: any, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setImgIndex(i)}
                  className={`h-2 rounded-full transition-all ${i === imgIndex ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`} 
                />
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ExploreRooms() {
  const { user } = useAuth();
  const { data: rooms, loading: roomsLoading } = useRealtimeData("rooms");
  const { data: houses } = useRealtimeData("houses");
  const { data: tenants } = useRealtimeData("tenants");

  const [search, setSearch] = useState("");
  const [selectedHouse, setSelectedHouse] = useState<string>("all");
  const [activeLocationHouse, setActiveLocationHouse] = useState<any>(null);
  const [checkoutRoom, setCheckoutRoom] = useState<any>(null);

  const filteredRooms = rooms.filter((r) => {
    if (selectedHouse !== "all" && r.house_id !== selectedHouse) return false;
    if (search && !r.number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group and sort rooms by house
  const roomsByHouse: Record<string, typeof rooms> = {};
  filteredRooms.forEach(room => {
    const houseId = room.house_id || "unassigned";
    if (!roomsByHouse[houseId]) {
      roomsByHouse[houseId] = [];
    }
    roomsByHouse[houseId].push(room);
  });

  // Sort houses by name, and rooms within houses by number
  Object.keys(roomsByHouse).forEach(houseId => {
    roomsByHouse[houseId].sort((a, b) => {
      // Natural sort for room numbers (e.g. "01" < "02" < "10")
      return a.number.localeCompare(b.number, undefined, { numeric: true });
    });
  });

  const houseGroups = Object.entries(roomsByHouse).map(([houseId, houseRooms]) => {
    const house = houses.find((h) => h.id === houseId);
    return {
      houseId,
      houseName: house?.name || "Main House",
      house,
      rooms: houseRooms
    };
  }).sort((a, b) => a.houseName.localeCompare(b.houseName));

  const handleApply = (room: any) => {
    if (!user) {
      alert("Please log in to apply for a room.");
      return;
    }
    setCheckoutRoom(room);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-['Libre_Baskerville'] text-3xl tracking-tight">
            {selectedHouse === "all" ? "Choose a Location" : "Find Your Perfect Room"}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            {selectedHouse === "all" 
              ? "Select a boarding house location to view available rooms." 
              : "Browse available rooms in this location. Find the amenities you need and book instantly."}
          </p>
        </div>
        
        {selectedHouse !== "all" && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => setSelectedHouse("all")}
              className="mr-2 flex items-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              ← Back to Locations
            </button>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        )}
      </div>


      {/* Main Content */}
      {roomsLoading ? (
        <HouseLoading size="md" label="Loading available rooms..." className="py-20" />
      ) : selectedHouse === "all" ? (
        // SHOW LOCATIONS VIEW — show ALL houses, not just ones with vacant rooms
        houses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-24 text-center">
            <p className="font-medium text-lg">No locations available</p>
            <p className="text-muted-foreground text-sm mt-1">There are no boarding houses set up yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {houses.map((house: any) => {
              const houseRooms = rooms.filter((r: any) => r.house_id === house.id);
              const vacantRooms = houseRooms.filter((r: any) => r.status === "vacant" || r.status !== "occupied");
              const vacantCount = vacantRooms.length;
              return (
              <motion.div
                key={house.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedHouse(house.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedHouse(house.id);
                  }
                }}
                className="group flex flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-card p-8 text-center transition-all hover:border-primary hover:shadow-xl hover:shadow-primary/5">
                <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Building2 size={32} />
                </div>
                <div>
                  <h3 className="font-['Libre_Baskerville'] text-2xl font-bold">{house.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {houseRooms.length === 0
                      ? "No rooms yet"
                      : vacantCount === 0
                        ? "Fully Occupied"
                        : `${vacantCount} ${vacantCount === 1 ? "room" : "rooms"} available`
                    }
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveLocationHouse(house);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20">
                  <MapPin size={14} /> See Location
                </button>
              </motion.div>
            )})}
          </div>
        )
      ) : (
        // SHOW ROOMS FOR SELECTED LOCATION
        <div className="space-y-12">
          {houseGroups.filter(g => g.houseId === selectedHouse).map((group) => (
            <div key={group.houseId} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 size={20} />
                </div>
                <h2 className="font-['Libre_Baskerville'] text-2xl font-bold">{group.houseName}</h2>
                <span className="ml-auto rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {group.rooms.length} {group.rooms.length === 1 ? 'room' : 'rooms'}
                </span>
              </div>
              
              {group.rooms.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border py-24 text-center">
                  <p className="font-medium text-lg">No rooms match your search</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {group.rooms.map((room) => (
                    <RoomCard key={room.id} room={room} group={group} onApply={handleApply} tenants={tenants} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <LocationMapModal
        isOpen={Boolean(activeLocationHouse)}
        onClose={() => setActiveLocationHouse(null)}
        house={activeLocationHouse}
      />

      <CheckoutModal
        isOpen={Boolean(checkoutRoom)}
        onClose={() => setCheckoutRoom(null)}
        room={checkoutRoom}
        house={checkoutRoom ? houses.find(h => h.id === checkoutRoom.house_id) : null}
        user={user}
      />
    </div>
  );
}
