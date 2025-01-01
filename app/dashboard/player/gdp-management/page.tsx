"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoaderCircleIcon } from "lucide-react";

const GDPManagement: React.FC = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [gdpData, setGdpData] = useState<any>(null);
  const [industries, setIndustries] = useState<any>({});
  const [taxRates, setTaxRates] = useState<any>({});
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    if (!session) return;

    const fetchGdpData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users/${session.user.id}/gdpManagement`);
        setGdpData(res.data.data);
      } catch (error) {
        if (isAxiosError(error)) {
          console.error(error.response?.data.message ?? "something went wrong");
        } else {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGdpData();
  }, [session]);

  const handleInvestmentChange = (industry: string, value: any) => {
    setIndustries({ ...industries, [industry]: value });
  };

  const handleTaxRateChange = (tax: string, value: any) => {
    setTaxRates({ ...taxRates, [tax]: value });
  };

  const updateGdpManagement = async () => {
    try {
      setLoading(true);
      const payload = {
        industries,
        taxRates,
      };
      const res = await api.patch(`/api/users/${session?.user.id}/gdpManagement`, payload);
      if (res.data.success) {
        toast.success("GDP management updated successfully!");
        setGdpData(res.data.data);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">GDP Management Dashboard</h2>
      <Card>
        <CardHeader>
          <CardTitle>Current GDP and Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xl font-semibold">Current GDP: ${gdpData?.gdp.toFixed(2)}</p>
            <Button onClick={updateGdpManagement} disabled={loading}>
              {loading ? <LoaderCircleIcon className="animate-spin" /> : "Update GDP Management"}
            </Button>
          </div>
          <div className="space-y-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Label>Invest in Industries</Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Investing in industries can boost GDP growth.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Industry</TableHead>
                  <TableHead>Investment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(industries)?.map((industry) => (
                  <TableRow key={industry}>
                    <TableCell>{industry}</TableCell>
                    <TableCell>
                      <Input
                        value={industries[industry]}
                        onChange={(e) => handleInvestmentChange(industry, e.target.value)}
                        type="number"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="space-y-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Label>Adjust Tax Rates</Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adjusting tax rates affects GDP components.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tax</TableHead>
                  <TableHead>Rate (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(taxRates)?.map((tax) => (
                  <TableRow key={tax}>
                    <TableCell>{tax}</TableCell>
                    <TableCell>
                      <Input
                        value={taxRates[tax]}
                        onChange={(e) => handleTaxRateChange(tax, e.target.value)}
                        type="number"
                        min="0"
                        max="100"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => setHistoricalData([...historicalData, gdpData])}>
            View Historical Data
          </Button>
        </CardFooter>
      </Card>
      {historicalData.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Historical GDP Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>GDP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicalData?.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date().toLocaleDateString()}</TableCell>
                    <TableCell>${data?.gdp.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GDPManagement;