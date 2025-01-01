"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { LoaderCircle, Plus, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/componen/ui/card";
import { Label } from "@/componen/ui/label";
import { Input } from "@/componen/ui/input";
import { Button } from "@/componen/ui/button";
import { Textarea } from "@/componen/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/componen/ui/select";
import api from "@/lib/api";

const storySchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  imageUrl: z.string().optional(),
});

type StoryFormData = z.infer<typeof storySchema>;

const CreateStoryPage = () => {
  const { data: session } = useSession();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      tags: [],
    },
  });

  const onSubmit = async (data: StoryFormData) => {
    try {
      setLoading(true);
      const response = await api.post("/api/stories", {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
      });

      if (response.data.success) {
        toast.success("Story created successfully!");
      }
    } catch (error) {
      toast.error("Failed to create story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Create New Story</h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Story Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                {...register("title")}
                placeholder="Enter story title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                {...register("content")}
                placeholder="Write your story here..."
                className="min-h-[200px]"
              />
              {errors.content && (
                <p className="text-red-500 text-sm">{errors.content.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiction">Fiction</SelectItem>
                  <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                  <SelectItem value="biography">Biography</SelectItem>
                  <SelectItem value="poetry">Poetry</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500 text-sm">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                placeholder="Enter tags (comma separated)"
                onChange={(e) =>
                  setValue(
                    "tags",
                    e.target.value.split(",").map((tag) => tag.trim())
                  )
                }
              />
              {errors.tags && (
                <p className="text-red-500 text-sm">{errors.tags.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Story"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateStoryPage;