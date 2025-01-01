"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoaderCircleIcon } from "lucide-react";

interface Relationship {
  country: string;
  status: string;
}

interface CountryFeature {
  name: string;
  controlledBy: string;
  color: string;
  relationships: Relationship[];
}

const DiplomacyPage: React.FC = () => {
  const { data: session } = useSession();
  const { countryId } = useParams<{ countryId: string }>();

  const [loading, setLoading] = useState<boolean>(false);
  const [countryFeatures, setCountryFeatures] = useState<CountryFeature | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState<string>("neutral");

  useEffect(() => {
    if (!session) return;
    const fetchCountryFeatures = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/api/countries/${countryId}/features`
        );
        setCountryFeatures(res.data.data);
      } catch (error: any) {
        if (isAxiosError(error)) {
          console.error(error.response?.data.message);
        } else {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCountryFeatures();
  }, [session, countryId]);

  const updateRelationship = async (country: string, status: string) => {
    try {
      const res = await api.patch(
        `/api/users/${session?.user.id}/diplomaticRelationships`,
        { country, status }
      );
      if (res.data.success) {
        toast.success("Diplomatic relationship updated successfully!");
        setCountryFeatures((prev) => {
          if (prev) {
            return {
              ...prev,
              relationships: prev.relationships.map((rel) =>
                rel.country === country ? { ...rel, status } : rel
              ),
            };
          }
          return prev;
        });
      }
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Diplomatic Relationships</h2>
      {loading ? (
        <LoaderCircleIcon className="animate-spin" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {countryFeatures?.relationships?.map((relationship) => (
            <Card key={relationship.country}>
              <CardHeader>
                <CardTitle>{relationship.country}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Current Status: {relationship.status}
                </p>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="rival">Rival</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => updateRelationship(relationship.country, selectedStatus)}
                >
                  Update Status
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiplomacyPage;