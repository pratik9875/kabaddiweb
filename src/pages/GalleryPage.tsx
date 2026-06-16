import { useState } from 'react'
import { useGallery } from '../hooks/useGallery'
import { Spinner } from '../components/ui/Spinner'
import { Container } from '../components/ui/Container'
import { Image as ImageIcon, X } from 'lucide-react'

export function GalleryPage() {
  const { data: images, isLoading, isError } = useGallery()
  const [selected, setSelected] = useState<string | null>(null)

  if (isLoading) {
    return (
      <Container className="py-20 flex justify-center">
        <Spinner />
      </Container>
    )
  }

  if (isError) {
    return (
      <Container className="py-20 text-center text-red-600">
        Failed to load gallery.
      </Container>
    )
  }

  if (!images?.length) {
    return (
      <Container className="py-20 text-center text-gray-500">
        <ImageIcon size={64} className="mx-auto mb-4 text-gray-200" />
        <p className="font-medium">No images in the gallery yet.</p>
      </Container>
    )
  }

  return (
    <section className="px-6 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gallery</h1>
        <p className="mt-1 text-sm text-gray-500">Moments captured through the years</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => setSelected(img.image_url)}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-slate-100 shadow-sm cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            <img
              src={img.image_url}
              alt={img.caption ?? ''}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {img.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-xs text-white font-medium line-clamp-2">{img.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur hover:bg-white/40 transition-colors"
          >
            <X size={20} />
          </button>
          <img
            src={selected}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
