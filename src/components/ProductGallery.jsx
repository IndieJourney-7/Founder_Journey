import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Image, Upload, Trash2, GripVertical } from 'lucide-react';
import { useMountain } from '../context/MountainContext';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function ProductGallery({ compact = false }) {
    const { productImages, addProductImage, deleteProductImage } = useMountain();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (files) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        setError(null);

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Please upload PNG, JPG, or WebP images only');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError('Image must be under 2MB');
            return;
        }

        setIsUploading(true);

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onload = async (e) => {
                const result = await addProductImage({
                    data: e.target.result,
                    name: file.name
                });

                if (!result.success) {
                    setError(result.error || 'Failed to upload image');
                }
                setIsUploading(false);
            };
            reader.onerror = () => {
                setError('Failed to read file');
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setError('Failed to upload image');
            setIsUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDelete = async (imageId) => {
        await deleteProductImage(imageId);
    };

    // Compact view for banner modal
    if (compact) {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-white">Product Images</label>
                    <span className="text-xs text-white/40">{productImages.length}/3</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {productImages.map((img) => (
                        <div
                            key={img.id}
                            className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-white/10 group"
                        >
                            <img
                                src={img.data}
                                alt={img.name}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => handleDelete(img.id)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <Trash2 size={16} className="text-red-400" />
                            </button>
                        </div>
                    ))}

                    {productImages.length < 3 && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-16 h-16 rounded-lg border-2 border-dashed border-white/20 hover:border-brand-teal/50 flex items-center justify-center transition-colors"
                        >
                            {isUploading ? (
                                <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Plus size={20} className="text-white/40" />
                            )}
                        </button>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                />

                {error && (
                    <p className="text-xs text-red-400">{error}</p>
                )}
            </div>
        );
    }

    // Full gallery view for Dashboard
    return (
        <div className="bg-[#0A1628]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Image size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Product Gallery</h3>
                        <p className="text-sm text-white/50">Add images to showcase in your banners</p>
                    </div>
                </div>
                <span className="text-sm text-white/40 bg-white/5 px-3 py-1 rounded-full">
                    {productImages.length}/3 images
                </span>
            </div>

            {/* Upload Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => productImages.length < 3 && fileInputRef.current?.click()}
                className={`
                    relative rounded-xl border-2 border-dashed p-6 transition-all cursor-pointer
                    ${dragOver
                        ? 'border-brand-teal bg-brand-teal/10'
                        : 'border-white/10 hover:border-white/20 bg-black/20'
                    }
                    ${productImages.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    disabled={productImages.length >= 3}
                />

                <div className="text-center">
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-3 border-brand-teal border-t-transparent rounded-full animate-spin" />
                            <p className="text-white/60">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <Upload size={32} className="mx-auto text-white/30 mb-3" />
                            <p className="text-white/60 text-sm">
                                {productImages.length >= 3
                                    ? 'Maximum 3 images reached'
                                    : 'Drop image here or click to upload'
                                }
                            </p>
                            <p className="text-white/30 text-xs mt-1">PNG, JPG, WebP up to 2MB</p>
                        </>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-3 flex items-center gap-2"
                >
                    <X size={14} />
                    {error}
                </motion.p>
            )}

            {/* Image Grid */}
            <AnimatePresence>
                {productImages.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 grid grid-cols-3 gap-3"
                    >
                        {productImages.map((img, index) => (
                            <motion.div
                                key={img.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative aspect-square rounded-xl overflow-hidden border-2 border-white/10 group"
                            >
                                <img
                                    src={img.data}
                                    alt={img.name}
                                    className="w-full h-full object-cover"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                                        <span className="text-white text-xs font-medium truncate max-w-[60%]">
                                            {img.name}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(img.id);
                                            }}
                                            className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Index Badge */}
                                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                                    {index + 1}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tips */}
            {productImages.length === 0 && (
                <div className="mt-4 p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/20">
                    <p className="text-brand-gold text-sm font-medium mb-2">Pro Tip</p>
                    <p className="text-white/60 text-xs">
                        Add your product screenshots, logos, or app images. They'll appear in your shareable banners alongside your journey progress - perfect for marketing!
                    </p>
                </div>
            )}
        </div>
    );
}
