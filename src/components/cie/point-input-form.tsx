
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

// Use a factory function to create a schema with dynamic error messages
const createPointSchema = (labelHoriz: string, labelVert: string) => z.object({
  name: z.string().min(1, { message: "點位名稱為必填項。" }),
  uPrime: z.coerce
    .number({ invalid_type_error: `${labelHoriz}必須是數字。` }),
  vPrime: z.coerce
    .number({ invalid_type_error: `${labelVert}必須是數字。` }),
});

type PointFormData = z.infer<ReturnType<typeof createPointSchema>>;

interface PointInputFormProps {
  onSubmit: (data: PointFormData) => void;
  labelHoriz: string;
  labelVert: string;
  placeholderHoriz: string;
  placeholderVert: string;
}

export function PointInputForm({ 
  onSubmit, 
  labelHoriz, 
  labelVert, 
  placeholderHoriz,
  placeholderVert
}: PointInputFormProps) {
  // The schema is now created inside the component to use the props
  const pointSchema = createPointSchema(labelHoriz, labelVert);

  const form = useForm<PointFormData>({
    // The resolver needs to be updated if the schema changes
    resolver: zodResolver(pointSchema),
    defaultValues: {
      name: "",
      uPrime: undefined, 
      vPrime: undefined,
    },
  });

  // Watch for prop changes to reset the form validation
  // This is important because the zod schema is now created dynamically
  const formResolver = zodResolver(pointSchema);
  if (form.resolver !== formResolver) {
      form.resolver = formResolver;
  }

  const handleSubmit = (data: PointFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">新增點位</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>點位名稱</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：D65" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="uPrime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labelHoriz}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={placeholderHoriz} {...field} step="0.0001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vPrime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labelVert}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={placeholderVert} {...field} step="0.0001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              新增點位
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
