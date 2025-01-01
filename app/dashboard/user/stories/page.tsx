"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Plus, LoaderCircle, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/componen/ui/card";
import { Input } from "@/componen/ui/input";
import { Button } from "@/componen/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/componen/ui/pagination";
import api from "@/lib/api";

interface Story {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const StoriesPage = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/stories?page=${page}&search=${searchQuery}`);
      setStories(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [page, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="flex-1 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Stories</h2>
        <Button onClick={() => window.location.href = `/dashboard/user/stories/create`}>
          <Plus className="w-4 h-4 mr-2" />
          Create Story
        </Button>
      </div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stories..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories?.map((story) => (
          <Card key={story.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{story.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                {story.content.substring(0, 100)}...
              </p>
              {story.imageUrl && (
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-48 object-cover rounded-lg mt-4"
                />
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => window.location.href = `/dashboard/user/stories/${story.id}`}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => setPage(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default StoriesPage;