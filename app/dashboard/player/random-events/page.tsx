"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const RandomEventsPage = () => {
  const { data: session } = useSession();
  const [randomEvents, setRandomEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    if (!session) return;
    const fetchRandomEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/users/${session?.user.id}/randomEvent`);
        if (response?.data?.success) {
          setRandomEvents(response?.data?.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRandomEvents();
  }, [session]);

  const handleEventResponse = async (event: any) => {
    try {
      const response = await api.post(`/api/users/${session?.user.id}/eventResponse`, { eventId: event?.id });
      if (response?.data?.success) {
        toast.success("Event response successful!");
        setRandomEvents((prevEvents) => prevEvents.filter((e) => e?.id !== event?.id));
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error?.response?.data?.message ?? "Something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Random Events</h2>
      {loading ? (
        <div className="flex justify-center items-center">
          <Dialog>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Loading...</DialogTitle>
                <DialogDescription>
                  Please wait while we fetch the data.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <Accordion type="single" collapsible>
          {randomEvents?.map((event) => (
            <AccordionItem key={event?.id} value={event?.id}>
              <AccordionTrigger>{event?.eventType}</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardHeader>
                    <CardTitle>{event?.eventType}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Impact: {JSON.stringify(event?.impact)}</p>
                    <Button variant="outline" onClick={() => setSelectedEvent(event)}>
                      Respond
                    </Button>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {selectedEvent && (
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Respond to Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to respond to this event?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => handleEventResponse(selectedEvent)}>Yes, Respond</AlertDialogAction>
              <AlertDialogAction onClick={() => setSelectedEvent(null)}>Cancel</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default RandomEventsPage;