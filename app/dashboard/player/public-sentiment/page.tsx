"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircleIcon } from "lucide-react";

interface SentimentData {
  sentiment: number;
  rebellion: boolean;
}

const PublicSentimentPage: React.FC = () => {
  const { data: session } = useSession();
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!session) return;
    const fetchSentimentData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/api/users/${session?.user.id}/publicSentiment`
        );
        setSentimentData(res.data.data);
      } catch (error) {
        console.error("Failed to fetch sentiment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSentimentData();
  }, [session]);

  const handleImproveSentiment = async () => {
    // Placeholder for sentiment improvement logic
    toast.success("Sentiment improvement action triggered!");
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Public Sentiment Monitor</h2>
      <Card>
        <CardHeader>
          <CardTitle>Current Sentiment Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center">
              <LoaderCircleIcon className="animate-spin w-6 h-6" />
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-xl font-bold">
                  Sentiment Level: {sentimentData?.sentiment ?? "N/A"}
                </p>
                {sentimentData?.rebellion && (
                  <p className="text-red-500 font-semibold">
                    Rebellion Mechanics Activated!
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleImproveSentiment}
                className="w-full"
              >
                Improve Sentiment
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {sentimentData?.rebellion && (
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Critical Alert!</AlertDialogTitle>
              <AlertDialogDescription>
                The public sentiment is at a critical level. Immediate actions
                are required to prevent further escalation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleImproveSentiment}>
                Take Action
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default PublicSentimentPage;