"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircleIcon } from "lucide-react";

interface Country {
  name: string;
  controlledBy: string;
  color: string;
}

const CountrySelectionPage: React.FC = () => {
  const { data: session } = useSession();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/worldMap");
        setCountries(res.data.data.countries);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  const handleSaveSelection = async () => {
    if (!selectedCountry || !selectedColor) {
      toast.error("Please select both country and color.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        country: selectedCountry,
        color: selectedColor,
      };

      const response = await api.post(`/api/users/${session?.user.id}/countrySelection`, payload);

      if (response.data.success) {
        toast.success("Country and color selection saved successfully!");
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
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Select a Country to Govern</h2>
      <Card>
        <CardHeader>
          <CardTitle>Country Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={selectedCountry} onValueChange={(e) => setSelectedCountry(e)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries?.map((country) => (
                  <SelectItem key={country?.name} value={country?.name}>
                    {country?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              placeholder="Select a unique color"
            />
          </div>

          <Button className="w-full" onClick={handleSaveSelection} disabled={loading}>
            {loading ? <LoaderCircleIcon className="animate-spin" /> : "Save Selection"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CountrySelectionPage;