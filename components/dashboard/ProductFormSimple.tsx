"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  stock: number;
  images: string[];
}

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
}

const ProductForm = ({ product, onSuccess }: ProductFormProps) => {
  const [formData, setFormData] = useState<Product>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    salePrice: product?.salePrice || 0,
    stock: product?.stock || 0,
    images: product?.images || [],
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    field: keyof Product,
    value: string | number | string[] | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "products");
      formData.append("useUniqueFileName", "true");
      formData.append("tags", "product-image");

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, data.url],
      }));

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    handleImageUpload(file);
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.price <= 0) {
      toast.error("Please provide product name and valid price");
      return;
    }

    setLoading(true);
    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          `Product ${product ? "updated" : "created"} successfully`
        );
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter product name"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleInputChange("description", e.target.value)
            }
            placeholder="Enter product description"
            rows={3}
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price (Rs) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                handleInputChange("price", parseInt(e.target.value) || 0)
              }
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="salePrice">Sale Price (Rs)</Label>
            <Input
              id="salePrice"
              type="number"
              value={formData.salePrice || ""}
              onChange={(e) =>
                handleInputChange("salePrice", parseInt(e.target.value) || 0)
              }
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="stock">Stock Quantity *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) =>
              handleInputChange("stock", parseInt(e.target.value) || 0)
            }
            placeholder="0"
            min="0"
            required
          />
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <Label>Product Images</Label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="grid grid-cols-3 gap-4">
          {formData.images.map((image, index) => (
            <div key={index} className="relative">
              <Image
                height={96}
                width={96}
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-24 object-cover rounded border"
              />
              <Button
                type="button"
                onClick={() => removeImage(index)}
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {formData.images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-gray-400 transition-colors"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
              ) : (
                <Upload className="h-6 w-6 text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading || uploading}>
          {loading
            ? "Saving..."
            : product
            ? "Update Product"
            : "Create Product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
