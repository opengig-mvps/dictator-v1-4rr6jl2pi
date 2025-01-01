"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { LoaderCircle, Edit, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

const StoryDetailPage = () => {
  const { storyId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");

  const fetchStory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/stories/${storyId}`);
      setStory(res.data.data);
      setTitle(res.data.data?.title);
      setContent(res.data.data?.content);
      setImageUrl(res.data.data?.imageUrl);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditStory = async () => {
    try {
      setEditLoading(true);
      const payload = {
        title,
        content,
        imageUrl,
      };
      const res = await api.patch(`/api/stories/${storyId}`, payload);
      if (res.data.success) {
        toast.success("Story updated successfully!");
        fetchStory();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteStory = async () => {
    try {
      setDeleteLoading(true);
      const res = await api.delete(`/api/stories/${storyId}`);
      if (res.data.success) {
        toast.success("Story deleted successfully!");
        router.push("/dashboard/user/stories");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{story?.title}</CardTitle>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Story</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={title}
                        onChange={(e: any) => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        value={content}
                        onChange={(e: any) => setContent(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={imageUrl}
                        onChange={(e: any) => setImageUrl(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleEditStory}
                      disabled={editLoading}
                    >
                      {editLoading ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your story.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteStory}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {story?.imageUrl && (
            <img
              src={story?.imageUrl}
              alt={story?.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          <p className="text-muted-foreground">{story?.content}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryDetailPage;