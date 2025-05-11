
"use client";
import type { User } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useState } from "react";

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name cannot exceed 50 characters." }),
  photoUrlString: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  photoFile: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || (files?.[0]?.size ?? 0) <= MAX_FILE_SIZE_BYTES,
      `Max file size is ${MAX_FILE_SIZE_MB}MB.`
    )
    .refine(
      (files) => !files || files.length === 0 || (files?.[0]?.type?.startsWith("image/") ?? false),
      "Only image files (e.g., JPG, PNG, GIF) are accepted."
    ),
  bio: z.string().max(300, { message: "Bio cannot exceed 300 characters." }).optional().or(z.literal('')),
  status: z.string().max(100, { message: "Status cannot exceed 100 characters." }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditFormProps {
  user: User;
  onSave: () => void;
  formId: string;
}

export default function ProfileEditForm({ user, onSave, formId }: ProfileEditFormProps) {
  const { updateProfile } = useAuth();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || "",
      photoUrlString: (user.photoUrl && !user.photoUrl.startsWith("data:image/")) ? user.photoUrl : "",
      photoFile: undefined,
      bio: user.bio || "",
      status: user.status || "",
    },
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(user.photoUrl || null);
  const photoFileRef = form.register("photoFile");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Clear previous file-related errors
      form.clearErrors("photoFile");

      if (file.size > MAX_FILE_SIZE_BYTES) {
        form.setError("photoFile", { type: "manual", message: `File size exceeds ${MAX_FILE_SIZE_MB}MB.` });
        setPhotoPreview(user.photoUrl || null); // Revert preview to original/current
        if(event.target) event.target.value = ""; // Clear the file input
        return;
      }
      if (!file.type.startsWith("image/")) {
        form.setError("photoFile", { type: "manual", message: "Only image files are accepted." });
        setPhotoPreview(user.photoUrl || null); // Revert preview
        if(event.target) event.target.value = ""; // Clear the file input
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // No file selected, update preview based on URL string or original photo
      const currentPhotoUrlString = form.getValues("photoUrlString");
      setPhotoPreview(currentPhotoUrlString || user.photoUrl || null);
      form.clearErrors("photoFile"); // Clear errors if selection is removed
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    let newPhotoUrl = user.photoUrl || ""; // Default to existing photo

    if (data.photoFile && data.photoFile.length > 0) {
      // File upload takes precedence
      const file = data.photoFile[0];
      // Re-validate here in case schema validation didn't catch something or for direct submissions
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ title: "Error", description: `File size exceeds ${MAX_FILE_SIZE_MB}MB.`, variant: "destructive"});
        return;
      }
      if (!file.type.startsWith("image/")) {
         toast({ title: "Error", description: "Invalid file type. Only images are allowed.", variant: "destructive"});
        return;
      }
      newPhotoUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } else if (form.formState.dirtyFields.photoUrlString) {
      // No file uploaded, but the URL string field was manually changed by the user
      newPhotoUrl = data.photoUrlString || ""; // If user cleared it, newPhotoUrl becomes empty
    }
    // If no file is uploaded and photoUrlString is not dirty, newPhotoUrl remains user.photoUrl (from initialization)

    updateProfile({
      name: data.name,
      photoUrl: newPhotoUrl,
      bio: data.bio,
      status: data.status,
    });

    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
    onSave();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id={formId} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {photoPreview && (
          <FormItem>
            <FormLabel>Photo Preview</FormLabel>
            <Avatar className="h-24 w-24 border">
              <AvatarImage src={photoPreview} alt="Profile preview" data-ai-hint="profile avatar"/>
              <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "P"}</AvatarFallback>
            </Avatar>
          </FormItem>
        )}

        <FormField
          control={form.control}
          name="photoFile"
          render={() => ( 
            <FormItem>
              <FormLabel>Upload New Photo</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  {...photoFileRef}
                  onChange={(e) => {
                    photoFileRef.onChange(e); 
                    handleFileChange(e);     
                  }}
                />
              </FormControl>
              <FormDescription>
                Max file size: ${MAX_FILE_SIZE_MB}MB. Accepted formats: JPG, PNG, GIF, etc.
                This will replace any URL entered below.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="photoUrlString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Or Enter Photo URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/your-photo.jpg" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    const currentPhotoFile = form.getValues("photoFile");
                    if(!currentPhotoFile || currentPhotoFile.length === 0){
                      setPhotoPreview(e.target.value || user.photoUrl || null);
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                Alternatively, provide a URL. If you upload a file, this URL will be ignored. Clear this field to remove photo if not uploading.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>A short description about you (max 300 characters).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Input placeholder="What are you up to?" {...field} />
              </FormControl>
              <FormDescription>A brief status message (max 100 characters).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Save button is now in SheetFooter in parent component */}
      </form>
    </Form>
  );
}
