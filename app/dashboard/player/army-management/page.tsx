"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LoaderCircleIcon } from "lucide-react";

const ArmyManagementPage: React.FC = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [armyStats, setArmyStats] = useState<any>({
    airForce: 0,
    navy: 0,
    ground: 0,
    nuclear: 0,
  });
  const [investment, setInvestment] = useState<any>({
    airForce: 0,
    navy: 0,
    ground: 0,
    nuclear: 0,
  });

  useEffect(() => {
    if (!session) return;
    const fetchArmyStats = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users/${session.user.id}/armyManagement`);
        setArmyStats(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchArmyStats();
  }, [session]);

  const handleInvestmentChange = (e: any, type: string) => {
    setInvestment({ ...investment, [type]: Number(e.target.value) });
  };

  const handleInvest = async () => {
    try {
      setLoading(true);
      const res = await api.patch(`/api/users/${session?.user.id}/armyManagement`, investment);
      if (res.data.success) {
        toast.success("Army management updated successfully!");
        setArmyStats(res.data.data);
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
      <h2 className="text-2xl font-bold mb-6">Army Management</h2>
      <Card>
        <CardHeader>
          <CardTitle>Invest in Army Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {["airForce", "navy", "ground", "nuclear"].map((type) => (
            <div key={type} className="space-y-2">
              <label htmlFor={type} className="block text-sm font-medium text-gray-700">
                {type.charAt(0).toUpperCase() + type.slice(1)}: {armyStats[type]}
              </label>
              <Input
                type="number"
                id={type}
                value={investment[type]}
                onChange={(e) => handleInvestmentChange(e, type)}
                min={0}
                className="mt-1 block w-full"
              />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleInvest} disabled={loading}>
            {loading ? <LoaderCircleIcon className="animate-spin" /> : "Invest"}
          </Button>
        </CardFooter>
      </Card>
      <Alert className="mt-6">
        <AlertTitle>Note:</AlertTitle>
        <AlertDescription>
          Ensure you have enough resources before investing. Over-investment will be rejected.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ArmyManagementPage;