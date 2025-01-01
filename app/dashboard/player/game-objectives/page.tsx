'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateTimePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderCircleIcon } from 'lucide-react';

const GameObjectivesPage: React.FC = () => {
  const { data: session } = useSession();
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [color, setColor] = useState<string>('#ffffff');
  const [loading, setLoading] = useState<boolean>(false);
  const [capturedCountries, setCapturedCountries] = useState<any[]>([]);

  useEffect(() => {
    const fetchWorldMap = async () => {
      try {
        const response = await api.get('/api/worldMap');
        setCountries(response.data.data.countries);
      } catch (error) {
        console.error(error);
      }
    };

    fetchWorldMap();
  }, []);

  const handleCountrySelection = async () => {
    if (!selectedCountry || !color) {
      toast.error('Please select a country and a color.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/api/users/${session?.user.id}/countrySelection`, {
        country: selectedCountry,
        color,
      });

      if (response.data.success) {
        toast.success('Country and color selection saved successfully');
        setCapturedCountries([...capturedCountries, response.data.data]);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? 'Something went wrong');
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureCountry = async (country: string) => {
    try {
      setLoading(true);
      const response = await api.post(`/api/users/${session?.user.id}/captureCountry`, {
        country,
      });

      if (response.data.success) {
        toast.success('Country captured successfully');
        setCapturedCountries([...capturedCountries, response.data.data]);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? 'Something went wrong');
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Game Objectives</h2>
      <Card>
        <CardHeader>
          <CardTitle>World Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries?.map((country) => (
              <div key={country?.name} className="border p-4 rounded-md">
                <h3 className="font-bold">{country?.name}</h3>
                <p>Controlled by: {country?.controlledBy || 'None'}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Label htmlFor="color">Color:</Label>
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
                <Button
                  className="mt-4"
                  onClick={() => handleCaptureCountry(country?.name)}
                  disabled={loading}
                >
                  {loading ? <LoaderCircleIcon className="animate-spin" /> : 'Capture Country'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="mt-6">
            Select Country and Color
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Country Selection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label>Country</Label>
              <Select value={selectedCountry ?? ''} onValueChange={setSelectedCountry}>
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
            <div className="flex items-center space-x-4">
              <Label>Color</Label>
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCountrySelection}
              disabled={loading}
            >
              {loading ? <LoaderCircleIcon className="animate-spin" /> : 'Save Selection'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameObjectivesPage;