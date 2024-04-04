import Image from "next/image";
import { ChevronLeft, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { api, type RouterOutputs } from "@/utils/api";
import { useState } from "react";
import MultipleSelector, { type Option } from "@/components/ui/multiSelect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function EditProduct({
  product,
  categories,
}: {
  product: NonNullable<RouterOutputs["store"]["product"]>;
  categories: NonNullable<RouterOutputs["categories"]["subcategories"]>;
}) {
  const router = useRouter();

  const [newName, setNewName] = useState(product.name);
  const [newDescription, setNewDescription] = useState(product.description);
  const [newCategory, setNewCategory] = useState(product.Subcategory.id);
  const [newPrice, setNewPrice] = useState(product.price);

  const [deleteImageIndex, setDeleteImageDialog] = useState(-1);

  const [images, setImages] = useState<
    { type: "url" | "base64"; value: string }[]
  >(
    product.images.map((image) => ({
      value: image.url,
      type: "url",
    })),
  );

  const editProduct = api.product.edit.useMutation({
    onSuccess: () => {
      void router.push("/dashboard/products");
    },
  });

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <DashboardNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    router.back();
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                  {product.name}
                </h1>
                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      router.back();
                    }}
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      editProduct.mutate({
                        id: product.id,
                        categoryID: newCategory,
                        name: newName,
                        description: newDescription,
                        images: images,
                        price: newPrice,
                      });
                    }}
                  >
                    Save Product
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        <div className="grid gap-3">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            type="text"
                            className="w-full"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                          />
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            value={newPrice}
                            onChange={(e) =>
                              setNewPrice(Number(e.target.value))
                            }
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            className="min-h-32"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 sm:grid-cols-3">
                        <div className="col-span-2 grid gap-3">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={newCategory}
                            onValueChange={(v) => {
                              setNewCategory(v);
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Category">
                                {categories
                                  .map((c) => c.subcategories)
                                  .flat()
                                  .find((c) => c.id === newCategory)?.name ??
                                  "Category"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectGroup key={category.id}>
                                  <SelectLabel>{category.name}</SelectLabel>
                                  {category.subcategories.map((subcategory) => (
                                    <SelectItem
                                      key={subcategory.id}
                                      value={subcategory.id}
                                    >
                                      {subcategory.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>Product Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-3 gap-2">
                          {images.map((image, i) => (
                            <button
                              key={image.value}
                              onClick={() => {
                                setDeleteImageDialog(i);
                              }}
                            >
                              <Image
                                alt="Product image"
                                className="aspect-square w-full rounded-md object-cover"
                                height="120"
                                src={image.value}
                                width={120}
                              />
                            </button>
                          ))}
                          <label className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-md border border-dashed">
                            <input
                              type="file"
                              className="hidden h-full w-full"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) {
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  setImages([
                                    ...images,
                                    {
                                      type: "base64",
                                      value: e.target?.result as string,
                                    },
                                  ]);
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                            <Upload className="text-muted-foreground h-4 w-4" />
                            <span className="sr-only">Upload</span>
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 md:hidden">
                <Button variant="outline" size="sm">
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    editProduct.mutate({
                      id: product.id,
                      categoryID: newCategory,
                      name: newName,
                      description: newDescription,
                      images: images,
                      price: newPrice,
                    });
                  }}
                >
                  Save Product
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
      <AlertDialog
        open={deleteImageIndex >= 0}
        onOpenChange={(op) => {
          if (!op) setDeleteImageDialog(-1);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setImages(images.filter((_, i) => i !== deleteImageIndex));
                setDeleteImageDialog(-1);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function EditProductPage() {
  const session = useSession();
  const router = useRouter();
  const { productId } = router.query as { productId?: string };

  const product = api.store.product.useQuery(
    { id: productId ?? "" },
    {
      enabled:
        typeof productId === "string" && session.status === "authenticated",
    },
  );

  const categories = api.categories.subcategories.useQuery();

  if (typeof productId !== "string") {
    return null;
  }

  if (session.status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-slate-900 dark:border-slate-50"></div>
      </div>
    );
  }
  if (session.status === "unauthenticated") {
    void router.push("/");
    return null;
  }
  if (session.data?.user.userType !== "SELLER") {
    void router.push("/");
    return null;
  }
  if (!product.data || !categories.data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-slate-900 dark:border-slate-50"></div>
      </div>
    );
  }
  return <EditProduct categories={categories.data} product={product.data} />;
}
