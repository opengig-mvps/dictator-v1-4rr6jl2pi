"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, User, Settings, Globe } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const PlayerHome: React.FC = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<any>(null);
  const [worldMapData, setWorldMapData] = useState<any>(null);

  useEffect(() => {
    if (!session) {
      return;
    }
    const fetchGameStatus = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users/${session.user.id}/publicSentiment`);
        setGameStatus(res.data.data);
      } catch (error: any) {
        if (isAxiosError(error)) {
          console.error(error.response?.data.message ?? "Something went wrong");
        } else {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchWorldMapData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/worldMap`);
        setWorldMapData(res.data.data);
      } catch (error: any) {
        if (isAxiosError(error)) {
          console.error(error.response?.data.message ?? "Something went wrong");
        } else {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGameStatus();
    fetchWorldMapData();
  }, [session]);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Player Dashboard</h1>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/dashboard/player/home">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </NavigationMenuLink>
                <NavigationMenuLink href="/dashboard/player/profile">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </NavigationMenuLink>
                <NavigationMenuLink href="/dashboard/player/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Public Sentiment: {gameStatus?.sentiment ?? "Loading..."}</p>
              <p>GDP: {gameStatus?.gdp ?? "Loading..."}</p>
              <p>Army Strength: {gameStatus?.armyStrength ?? "Loading..."}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>World Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48 bg-gray-200">
                <Globe className="w-16 h-16 text-gray-500" />
                <p>Interactive World Map Coming Soon...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="bg-white p-4 shadow-md">Footer content goes here.</footer>
    </div>
  );
};

export default PlayerHome;