import { useEffect, useState } from 'react'
import { ImagePlus, Star, Trash2, Upload, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { definirImagemPrincipal, excluirImagem, listarImagens, reordenarImagens, uploadImagem } from '../../api/produtos'
import type { ImagemProduto } from '../../types/produto'

interface Props { produtoId?: string }
const allowed = ['image/jpeg', 'image/png', 'image/webp']
const maxSize = 5 * 1024 * 1024

function PreviewImage({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState('')
  useEffect(() => { const objectUrl = URL.createObjectURL(file); setUrl(objectUrl); return () => URL.revokeObjectURL(objectUrl) }, [file])
  return <div className="relative overflow-hidden rounded-xl bg-paper"><img src={url} alt={file.name} className="aspect-square w-full object-cover" /><button type="button" aria-label="Remover preview" onClick={onRemove} className="absolute right-2 top-2 rounded-full bg-ink/70 p-1 text-white"><X size={14} /></button></div>
}

export function ProdutoImages({ produtoId }: Props) {
  const queryClient = useQueryClient(); const [files, setFiles] = useState<File[]>([]); const [error, setError] = useState('')
  const query = useQuery({ queryKey: ['produto-imagens', produtoId], queryFn: () => listarImagens(produtoId!), enabled: Boolean(produtoId) })
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['produto-imagens', produtoId] })
  const upload = useMutation({ mutationFn: (file: File) => uploadImagem(produtoId!, file), onSuccess: invalidate })
  const remove = useMutation({ mutationFn: (id: string) => excluirImagem(produtoId!, id), onSuccess: invalidate })
  const principal = useMutation({ mutationFn: (id: string) => definirImagemPrincipal(produtoId!, id), onSuccess: invalidate })
  const order = useMutation({ mutationFn: (items: ImagemProduto[]) => reordenarImagens(produtoId!, { imagens: items.map((item, index) => ({ id: item.id, ordem: index + 1 })) }), onSuccess: invalidate })
  function choose(selected: FileList | null) { setError(''); if (!selected) return; const valid = Array.from(selected).filter((file) => allowed.includes(file.type) && file.size <= maxSize); if (valid.length !== selected.length) setError('Use JPG, JPEG, PNG ou WEBP com até 5 MB por imagem.'); setFiles((current) => [...current, ...valid]) }
  async function sendFiles() { for (const file of files) await upload.mutateAsync(file); setFiles([]) }
  async function move(index: number, direction: -1 | 1) { if (!query.data) return; const next = [...query.data]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; await order.mutateAsync(next) }
  return <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-lg font-bold">Imagens do produto</h2><p className="mt-1 text-sm text-ink/50">JPG, PNG ou WEBP · máximo 5 MB</p></div>{produtoId && <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-mint px-3 py-2 text-sm font-semibold text-teal"><ImagePlus size={17} />Adicionar<input type="file" multiple accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={(event) => choose(event.target.files)} /></label>}</div>{!produtoId && <p className="mt-5 rounded-xl bg-paper p-4 text-sm text-ink/55">Salve o produto para liberar o upload de imagens.</p>}{error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>} {files.length > 0 && <div className="mt-5"><p className="text-sm font-semibold">Pré-visualização</p><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{files.map((file, index) => <PreviewImage key={`${file.name}-${index}`} file={file} onRemove={() => setFiles(files.filter((_, itemIndex) => itemIndex !== index))} />)}</div><button type="button" disabled={upload.isPending} onClick={sendFiles} className="mt-4 flex items-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><Upload size={17} />{upload.isPending ? 'Enviando...' : 'Enviar imagens'}</button></div>}{produtoId && <div className="mt-6">{query.isLoading && <p className="text-sm text-ink/50">Carregando imagens...</p>}{query.isError && <p className="text-sm text-rose-600">Não foi possível carregar as imagens.</p>}<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{query.data?.map((image, index) => <div key={image.id} className="overflow-hidden rounded-xl border border-ink/10"><div className="relative"><img src={image.url} alt="Imagem do produto" className="aspect-square w-full object-cover" />{image.principal && <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-ink/80 px-2 py-1 text-xs font-semibold text-white"><Star size={12} fill="currentColor" />Principal</span>}</div><div className="flex flex-wrap items-center gap-1 p-2">{!image.principal && <button type="button" onClick={() => principal.mutate(image.id)} className="text-xs font-semibold text-teal">Definir principal</button>}<button type="button" disabled={remove.isPending} onClick={() => window.confirm('Excluir esta imagem?') && remove.mutate(image.id)} className="ml-auto p-1 text-rose-600"><Trash2 size={15} /></button><button type="button" disabled={index === 0 || order.isPending} onClick={() => move(index, -1)} className="px-1 text-xs text-ink/50">←</button><button type="button" disabled={index === (query.data?.length ?? 1) - 1 || order.isPending} onClick={() => move(index, 1)} className="px-1 text-xs text-ink/50">→</button></div></div>)}</div></div>}</section>
}
