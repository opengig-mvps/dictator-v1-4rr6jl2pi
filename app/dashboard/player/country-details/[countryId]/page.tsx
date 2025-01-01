'use client';

import React, { useEffect, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoaderCircleIcon } from 'lucide-react';

interface ArmyDetails {
  airForce: number;
  navy: number;
  ground: number;
  nuclear: number;
}

interface Relationship {
  country: string;
  status: string;
}

interface CountryFeatures {
  army: ArmyDetails;
  gdp: number;
  money: number;
  population: number;
  sentiment: number;
  relationships: Relationship[];
}

const CountryDetailsPage: React.FC = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const [countryFeatures, setCountryFeatures] = useState<CountryFeatures | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCountryFeatures = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/countries/${countryId}/features`);
        if (response.data.success) {
          setCountryFeatures(response.data.data);
        }
      } catch (error: any) {
        if (isAxiosError(error)) {
          toast.error(error.response?.data.message ?? 'Failed to fetch country features');
        } else {
          console.error(error);
          toast.error('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCountryFeatures();
  }, [countryId]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoaderCircleIcon className="animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Country Details</h1>
      {countryFeatures ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Army Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Strength</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Air Force</TableCell>
                    <TableCell>{countryFeatures.army?.airForce}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Navy</TableCell>
                    <TableCell>{countryFeatures.army?.navy}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ground</TableCell>
                    <TableCell>{countryFeatures.army?.ground}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Nuclear</TableCell>
                    <TableCell>{countryFeatures.army?.nuclear}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Economic and Population</CardTitle>
            </CardHeader>
            <CardContent>
              <p>GDP: ${countryFeatures.gdp?.toFixed(2)}</p>
              <p>Money in Bank: ${countryFeatures.money?.toFixed(2)}</p>
              <p>Population: {countryFeatures.population?.toLocaleString()}</p>
              <p>Public Sentiment: {countryFeatures.sentiment?.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countryFeatures.relationships?.map((relationship, index) => (
                    <TableRow key={index}>
                      <TableCell>{relationship.country}</TableCell>
                      <TableCell>{relationship.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p>No data available for this country.</p>
      )}
    </div>
  );
};

export default CountryDetailsPage;