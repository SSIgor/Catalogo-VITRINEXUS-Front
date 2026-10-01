import { ImageOff } from 'lucide-react'

export function CategoriaImage({ url, name }: { url?: string | null; name: string }) {
  return <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-mint text-teal">{url ? <img src={url} alt={`Imagem de ${name}`} className="h-full w-full object-cover" /> : <ImageOff size={18} />}</div>
}
