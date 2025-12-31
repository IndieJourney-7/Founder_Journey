import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Code,
    Copy,
    Check,
    X,
    ExternalLink,
    Image,
    Layout,
    Minimize2
} from 'lucide-react'
import { useMountain } from '../../context/MountainContext'
import { useToast } from '../../context/ToastContext'
import { BASE_URL, generateOGImageUrl } from '../SEO'

// Widget style options
const WIDGET_STYLES = {
    badge: {
        name: 'Badge',
        icon: Minimize2,
        description: 'Compact badge for GitHub READMEs',
        preview: 'h-8'
    },
    card: {
        name: 'Card',
        icon: Layout,
        description: 'Beautiful card for websites',
        preview: 'h-32'
    },
    image: {
        name: 'Image',
        icon: Image,
        description: 'Static image that auto-updates',
        preview: 'h-24'
    }
};

// Generate embed codes
const generateEmbedCode = (mountain, progress, style) => {
    const username = mountain?.username || 'founder';
    const title = mountain?.title || 'My Journey';
    const profileUrl = `${BASE_URL}/climb/@${username}`;

    // Generate dynamic image URL
    const imageUrl = generateOGImageUrl({
        username,
        title,
        target: mountain?.target,
        progress: Math.round(progress),
        cheers: mountain?.encouragement_count,
        type: 'profile'
    });

    // Badge-style (Shields.io inspired)
    const badgeUrl = `${BASE_URL}/api/badge?username=${username}&progress=${Math.round(progress)}`;

    switch (style) {
        case 'badge':
            return {
                markdown: `[![${title} Progress](${BASE_URL}/api/og?username=${username}&title=${encodeURIComponent(title)}&progress=${Math.round(progress)}&type=badge)](${profileUrl})`,
                html: `<a href="${profileUrl}" target="_blank" rel="noopener noreferrer">
  <img src="${imageUrl}" alt="${title} Progress - ${Math.round(progress)}%" height="40" />
</a>`,
                description: 'Perfect for GitHub READMEs and documentation'
            };

        case 'card':
            return {
                html: `<!-- SHIFT ASCENT Progress Widget -->
<div style="max-width: 400px; font-family: system-ui, sans-serif;">
  <a href="${profileUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
    <div style="background: linear-gradient(135deg, #0F1F3D 0%, #1a365d 100%); border-radius: 16px; padding: 20px; color: white;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #E7C778, #FCD34D); display: flex; align-items: center; justify-content: center; font-weight: bold; color: #0F1F3D; font-size: 20px;">
          ${username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style="font-weight: 700; font-size: 16px;">@${username}</div>
          <div style="font-size: 12px; opacity: 0.6;">Building in public</div>
        </div>
      </div>
      <div style="font-size: 14px; margin-bottom: 12px; opacity: 0.8;">${title}</div>
      <div style="background: rgba(255,255,255,0.1); border-radius: 8px; height: 8px; overflow: hidden;">
        <div style="width: ${Math.round(progress)}%; height: 100%; background: linear-gradient(90deg, #4CD4C0, #E7C778); border-radius: 8px;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px;">
        <span style="opacity: 0.6;">Progress</span>
        <span style="color: #E7C778; font-weight: 700;">${Math.round(progress)}%</span>
      </div>
    </div>
  </a>
</div>`,
                markdown: `[![${title}](${imageUrl})](${profileUrl})`,
                description: 'Embed on your personal website or blog'
            };

        case 'image':
        default:
            return {
                markdown: `[![${title} - ${Math.round(progress)}% Complete](${imageUrl})](${profileUrl})`,
                html: `<a href="${profileUrl}" target="_blank" rel="noopener noreferrer">
  <img src="${imageUrl}" alt="${title} - ${Math.round(progress)}% Complete" width="600" style="border-radius: 12px;" />
</a>`,
                imageUrl,
                description: 'Auto-updating image for any platform'
            };
    }
};

export default function EmbedWidget({ isOpen, onClose }) {
    const { currentMountain, progress } = useMountain();
    const toast = useToast();
    const [selectedStyle, setSelectedStyle] = useState('image');
    const [copiedType, setCopiedType] = useState(null);

    if (!isOpen) return null;

    const embedCode = generateEmbedCode(currentMountain, progress, selectedStyle);

    const handleCopy = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedType(type);
            toast.success('Copied!', `${type} code copied to clipboard`);
            setTimeout(() => setCopiedType(null), 2000);
        } catch (err) {
            toast.error('Failed to copy', 'Please try again');
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="w-full max-w-2xl max-h-[85vh] bg-[#0F1F3D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-teal/20 rounded-xl">
                                <Code className="w-6 h-6 text-brand-teal" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Embed Your Progress</h2>
                                <p className="text-sm text-white/50">Add a live progress widget anywhere</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-white/60" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Style Selector */}
                        <div>
                            <label className="text-sm text-white/60 mb-3 block">Widget Style</label>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.entries(WIDGET_STYLES).map(([key, style]) => {
                                    const Icon = style.icon;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedStyle(key)}
                                            className={`p-4 rounded-xl border transition-all text-left ${selectedStyle === key
                                                ? 'bg-brand-teal/20 border-brand-teal'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 mb-2 ${selectedStyle === key ? 'text-brand-teal' : 'text-white/60'}`} />
                                            <div className="font-medium text-white text-sm">{style.name}</div>
                                            <div className="text-xs text-white/40 mt-1">{style.description}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Preview */}
                        <div>
                            <label className="text-sm text-white/60 mb-3 block">Preview</label>
                            <div className="p-6 bg-white rounded-xl">
                                {selectedStyle === 'image' && embedCode.imageUrl && (
                                    <img
                                        src={embedCode.imageUrl}
                                        alt="Widget preview"
                                        className="w-full rounded-lg"
                                    />
                                )}
                                {selectedStyle === 'card' && (
                                    <div dangerouslySetInnerHTML={{ __html: embedCode.html }} />
                                )}
                                {selectedStyle === 'badge' && (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="bg-gradient-to-r from-brand-blue to-brand-teal text-white px-4 py-2 rounded-full text-sm font-medium">
                                            {currentMountain?.title || 'My Journey'}: {Math.round(progress)}%
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-white/40 mt-2">{embedCode.description}</p>
                        </div>

                        {/* Code Blocks */}
                        <div className="space-y-4">
                            {/* HTML Code */}
                            {embedCode.html && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm text-white/60">HTML</label>
                                        <button
                                            onClick={() => handleCopy(embedCode.html, 'HTML')}
                                            className="flex items-center gap-1 px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                                        >
                                            {copiedType === 'HTML' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copiedType === 'HTML' ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <pre className="p-4 bg-black/30 rounded-xl overflow-x-auto text-xs text-white/80 font-mono">
                                        <code>{embedCode.html}</code>
                                    </pre>
                                </div>
                            )}

                            {/* Markdown Code */}
                            {embedCode.markdown && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm text-white/60">Markdown (GitHub, Notion)</label>
                                        <button
                                            onClick={() => handleCopy(embedCode.markdown, 'Markdown')}
                                            className="flex items-center gap-1 px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                                        >
                                            {copiedType === 'Markdown' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copiedType === 'Markdown' ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <pre className="p-4 bg-black/30 rounded-xl overflow-x-auto text-xs text-white/80 font-mono">
                                        <code>{embedCode.markdown}</code>
                                    </pre>
                                </div>
                            )}

                            {/* Direct Image URL */}
                            {embedCode.imageUrl && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm text-white/60">Direct Image URL</label>
                                        <button
                                            onClick={() => handleCopy(embedCode.imageUrl, 'URL')}
                                            className="flex items-center gap-1 px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                                        >
                                            {copiedType === 'URL' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copiedType === 'URL' ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <pre className="p-4 bg-black/30 rounded-xl overflow-x-auto text-xs text-white/80 font-mono break-all">
                                        <code>{embedCode.imageUrl}</code>
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* Use Cases */}
                        <div className="p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-xl">
                            <h4 className="font-medium text-brand-gold mb-2">Where to use this</h4>
                            <ul className="text-sm text-white/60 space-y-1">
                                <li>• GitHub README to show your startup progress</li>
                                <li>• Personal website or portfolio</li>
                                <li>• Email signature for accountability</li>
                                <li>• Notion workspace or documentation</li>
                                <li>• Blog posts about your journey</li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10 flex items-center justify-between">
                        <a
                            href={`${BASE_URL}/climb/@${currentMountain?.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-brand-teal hover:underline"
                        >
                            View public profile
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                        >
                            Done
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
