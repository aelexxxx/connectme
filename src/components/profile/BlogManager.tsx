
"use client";
import type { BlogPost } from "@/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, PlusCircle, CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

interface BlogManagerProps {
  posts: BlogPost[];
}

export default function BlogManager({ posts }: BlogManagerProps) {
  const { addBlogPost, updateBlogPost, deleteBlogPost, isGuest } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [currentContent, setCurrentContent] = useState<string>("");

  const handleSubmit = () => {
    if (!currentTitle.trim() || !currentContent.trim()) {
      toast({ title: "Validation Error", description: "Title and content cannot be empty.", variant: "destructive" });
      return;
    }

    if (editingPost) {
      updateBlogPost(editingPost.id, { title: currentTitle, content: currentContent });
      toast({ title: "Post Updated", description: "Blog post updated successfully." });
    } else {
      addBlogPost({ title: currentTitle, content: currentContent });
      toast({ title: "Post Added", description: "New blog post created." });
    }
    resetForm();
  };

  const resetForm = () => {
    setEditingPost(null);
    setCurrentTitle("");
    setCurrentContent("");
    setIsDialogOpen(false);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setCurrentTitle(post.title);
    setCurrentContent(post.content);
    setIsDialogOpen(true);
  };

  const handleDelete = (postId: string) => {
    deleteBlogPost(postId);
    toast({ title: "Post Deleted", description: "Blog post removed." });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Blog Entries</h3>
        {!isGuest && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingPost ? "Edit" : "Create New"} Blog Post</DialogTitle>
                <DialogDescription>
                  {editingPost ? "Update your existing" : "Share your thoughts by creating a new"} blog post.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    placeholder="Your amazing post title"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={currentContent}
                    onChange={(e) => setCurrentContent(e.target.value)}
                    placeholder="Write your thoughts here..."
                    rows={8}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90 text-accent-foreground">{editingPost ? "Save Changes" : "Create Post"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {posts && posts.length > 0 ? (
        <div className="space-y-6">
          {posts.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((post) => ( // Sort by date descending
            <Card key={post.id} className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription className="flex items-center text-xs">
                  <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                  {format(new Date(post.date), "MMMM d, yyyy 'at' h:mm a")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.content.substring(0, 200)}{post.content.length > 200 ? "..." : ""}</p>
                {post.content.length > 200 && <Button variant="link" className="p-0 h-auto text-xs">Read more</Button>}
              </CardContent>
              {!isGuest && (
                <CardFooter className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                    <Edit className="mr-1.5 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center">No blog posts yet. Share your thoughts!</p>
      )}
    </div>
  );
}
