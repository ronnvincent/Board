import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Wifi, Wind, Bath, Search, ArrowRight, Building2 } from "lucide-react";
import { useRealtimeData } from "../hooks/useRealtimeData";
import { supabase } from "../../lib/supabase";

export default function ExploreRooms() {
  const { data: rooms, loading: roomsLoading } = useRealtimeData("rooms");
  const { data: houses } = useRealtimeData("houses");

  const [search, setSearch] = useState("");
  const [selectedHouse, setSelectedHouse] = useState<string>("all");

  const filteredRooms = rooms.filter((r) => {
    if (r.status !== "vacant") return false;
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
      rooms: houseRooms
    };
  }).sort((a, b) => a.houseName.localeCompare(b.houseName));

  const handleApply = async (roomId: string) => {
    // In a real app, this would create an application record or move the user to a checkout screen
    alert(`Application started for Room ${roomId}! House admin will be notified.`);
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
        <div className="py-20 text-center text-muted-foreground">Loading...</div>
      ) : selectedHouse === "all" ? (
        // SHOW LOCATIONS VIEW
        houseGroups.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-24 text-center">
            <p className="font-medium text-lg">No locations available</p>
            <p className="text-muted-foreground text-sm mt-1">There are no available rooms right now.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {houseGroups.map((group) => (
              <motion.button
                key={group.houseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedHouse(group.houseId)}
                className="group flex flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-card p-8 text-center transition-all hover:border-primary hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Building2 size={32} />
                </div>
                <div>
                  <h3 className="font-['Libre_Baskerville'] text-2xl font-bold">{group.houseName}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {group.rooms.length} {group.rooms.length === 1 ? "room" : "rooms"} available
                  </p>
                </div>
              </motion.button>
            ))}
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
                  {group.rooms.map((room) => {
                    const features = room.features || ["AC", "Wi-Fi"];
                    const hasAC = features.includes("AC") || features.includes("Air Conditioning");
                    const hasWifi = features.includes("Wi-Fi") || features.includes("Internet");
                    const price = room.price || 5000;
                    const images = room.images || [];

                    return (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:shadow-xl hover:shadow-primary/5"
                      >
                        {/* Image Placeholder */}
                        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                          {images.length > 0 ? (
                            <img src={images[0]} alt={`Room ${room.number}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#e6eedb]">
                              <span className="font-['Libre_Baskerville'] text-4xl text-primary/20">Room {room.number}</span>
                            </div>
                          )}
                          <div className="absolute top-4 left-4 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs font-bold text-emerald-600">
                            Available
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
                            {room.description || "A clean, quiet, and well-maintained room perfectly suited for students and professionals."}
                          </p>

                          <div className="flex items-center gap-4 border-t border-border pt-4 mb-6">
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
                            onClick={() => handleApply(room.id)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-[#173f39] group-hover:gap-3"
                          >
                            Apply Now <ArrowRight size={16} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
