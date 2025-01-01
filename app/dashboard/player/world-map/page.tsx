"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoaderCircleIcon } from "lucide-react";

interface Country {
  name: string;
  controlledBy: string;
  color: string;
}

const WorldMapPage: React.FC = () => {
  const { data: session } = useSession();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchWorldMapData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/worldMap");
        setCountries(res.data.data.countries);
      } catch (error) {
        if (isAxiosError(error)) {
          console.error(error.response?.data.message ?? "Something went wrong");
        } else {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWorldMapData();
  }, []);

  const handleCountrySelection = async () => {
    if (!selectedCountry) {
      toast.error("Please select a country.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        country: selectedCountry,
        color: selectedColor,
      };

      const res = await api.post(`/api/users/${session?.user.id}/countrySelection`, payload);

      if (res.data.success) {
        toast.success("Country and color selection saved successfully!");
        setCountries((prevCountries) =>
          prevCountries.map((country) =>
            country.name === selectedCountry ? { ...country, color: selectedColor } : country
          )
        );
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Interactive World Map</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Select value={selectedCountry ?? ""} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              {countries?.map((country) => (
                <SelectItem key={country.name} value={country.name}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="border p-2"
          />
          <Button onClick={handleCountrySelection} disabled={loading}>
            {loading ? <LoaderCircleIcon className="animate-spin" /> : "Select Country"}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {countries?.map((country) => (
            <Card key={country.name} className="flex flex-col" style={{ backgroundColor: country.color }}>
              <CardHeader>
                <CardTitle>{country.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Controlled by: {country.controlledBy || "N/A"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <footer className="bg-white p-4 shadow-md">Footer content goes here.</footer>
    </div>
  );
};

export default WorldMapPage;