'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Check, ArrowLeft } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  images: string[];
  vendor: string;
  productType: string;
  tags: string[];
  variants: unknown[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products/${id}`);
      const data = await response.json();
      
      if (data.success) {
        const normalizedProduct = {
          ...data.product,
          tags: Array.isArray(data.product?.tags)
            ? data.product.tags
            : typeof data.product?.tags === 'string'
            ? data.product.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
            : [],
          image:
            typeof data.product?.image === 'string' && data.product.image.startsWith('//')
              ? `https:${data.product.image}`
              : data.product?.image,
          images: Array.isArray(data.product?.images)
            ? data.product.images.map((src: string) => (typeof src === 'string' && src.startsWith('//') ? `https:${src}` : src)).filter(Boolean)
            : [],
        };
        setProduct(normalizedProduct);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Error loading product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
      });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const stripHtml = (html: string) => {
    return html?.replace(/<[^>]*>/g, '') || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={() => router.push('/products')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayImages = product.images && product.images.length > 0
    ? product.images
    : product.image
    ? [product.image]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Products
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="relative h-96 bg-gray-100 rounded-lg mb-4">
                {displayImages[selectedImage] ? (
                  <Image
                    src={displayImages[selectedImage]}
                    alt={product.title}
                    fill
                    className="object-contain p-4"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {displayImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {displayImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 bg-gray-100 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index ? 'border-blue-600' : 'border-transparent'
                      }`}
                    >
                      {img ? (
                        <Image
                          src={img}
                          alt={`${product.title} - ${index + 1}`}
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              
              {/* Vendor & Type */}
              <div className="flex gap-4 mb-4">
                {product.vendor && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {product.vendor}
                  </span>
                )}
                {product.productType && (
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {product.productType}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <div className="text-gray-600 leading-relaxed">
                  {stripHtml(product.description) || 'No description available'}
                </div>
              </div>

              {/* Tags */}
              {Array.isArray(product.tags) && product.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
                  addedToCart
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check size={20} />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </button>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✓ Quality guaranteed</p>
                  <p>✓ Fast shipping available</p>
                  <p>✓ Easy returns within 30 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
