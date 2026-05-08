'use client'

import * as React from 'react'
import { MessageCircle, Send, Paperclip, Image, FileText, X, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useLang } from '@/contexts/lang-context'
import { DEMO_EMPLOYEES } from '@/contexts/auth-context'

interface Props {
  open: boolean
  onClose: () => void
  /** Pre-fill recipient phone */
  defaultPhone?: string
  /** Pre-fill recipient name */
  defaultName?: string
}

type MsgType = 'text' | 'image' | 'file'

export function WhatsAppSendDialog({ open, onClose, defaultPhone = '', defaultName = '' }: Props) {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const [phone, setPhone] = React.useState(defaultPhone)
  const [msgType, setMsgType] = React.useState<MsgType>('text')
  const [text, setText] = React.useState('')
  const [file, setFile] = React.useState<File | null>(null)
  const [sending, setSending] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  /* Sync default values when dialog reopens */
  React.useEffect(() => {
    if (open) { setPhone(defaultPhone); setText('') ; setFile(null); setMsgType('text') }
  }, [open, defaultPhone])

  const WAPI = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || ''
  const WTOKEN = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN || ''

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) { toast.error(isAr ? 'أدخل رقم الواتساب' : 'Enter WhatsApp number'); return }
    setSending(true)

    try {
      /* ── If WhatsApp API configured ── */
      if (WAPI && WTOKEN) {
        const cleanPhone = phone.replace(/\D/g, '')
        let body: FormData | string
        let contentType: string | undefined

        if (msgType === 'text') {
          body = JSON.stringify({ messaging_product: 'whatsapp', to: cleanPhone, type: 'text', text: { body: text } })
          contentType = 'application/json'
          await fetch(`${WAPI}/messages`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${WTOKEN}`, 'Content-Type': contentType },
            body,
          })
        } else if (file) {
          const fd = new FormData()
          fd.append('file', file)
          fd.append('messaging_product', 'whatsapp')
          const uploadRes = await fetch(`${WAPI}/media`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${WTOKEN}` },
            body: fd,
          })
          const { id: mediaId } = await uploadRes.json()
          const msgBody = msgType === 'image'
            ? { messaging_product: 'whatsapp', to: cleanPhone, type: 'image', image: { id: mediaId, caption: text } }
            : { messaging_product: 'whatsapp', to: cleanPhone, type: 'document', document: { id: mediaId, caption: text, filename: file.name } }
          await fetch(`${WAPI}/messages`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${WTOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(msgBody),
          })
        }
        toast.success(isAr ? 'تم الإرسال عبر واتساب ✅' : 'Sent via WhatsApp ✅')
      } else {
        /* ── Fallback: open wa.me link ── */
        const cleanPhone = phone.replace(/\D/g, '')
        const encoded = encodeURIComponent(text || (file ? file.name : ''))
        window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank')
        toast.success(isAr ? 'تم فتح واتساب — أرسل الرسالة يدوياً' : 'WhatsApp opened — send manually')
      }
      onClose()
    } catch (err: any) {
      toast.error(isAr ? 'فشل الإرسال' : 'Send failed', { description: err?.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle>{isAr ? 'إرسال رسالة واتساب' : 'Send WhatsApp Message'}</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {isAr ? 'نص · صور · ملفات' : 'Text · Images · Files'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={send} className="space-y-4 mt-2">
          {/* Recipient */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {isAr ? 'رقم واتساب المستلم' : 'Recipient WhatsApp Number'}
            </Label>
            <Input
              placeholder={isAr ? '+966501234567' : '+1 555 000 1234'}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
            />
          </div>

          {/* Quick select from employees */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{isAr ? 'أو اختر موظفاً' : 'Or pick an employee'}</Label>
            <Select onValueChange={(val) => {
              const emp = DEMO_EMPLOYEES.find((e) => e.id === val)
              if (emp) setPhone(`+966 5XX XXX XXX — ${emp.nameAr}`)
            }}>
              <SelectTrigger><SelectValue placeholder={isAr ? 'اختر...' : 'Select...'} /></SelectTrigger>
              <SelectContent>
                {DEMO_EMPLOYEES.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.nameAr} — {emp.employeeCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message type */}
          <div className="space-y-2">
            <Label>{isAr ? 'نوع الرسالة' : 'Message Type'}</Label>
            <div className="flex gap-2">
              {(['text', 'image', 'file'] as MsgType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setMsgType(t); setFile(null) }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                    msgType === t ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 font-medium' : 'border-border hover:border-green-300'
                  }`}
                >
                  {t === 'text' && <MessageCircle className="h-3.5 w-3.5" />}
                  {t === 'image' && <Image className="h-3.5 w-3.5" />}
                  {t === 'file' && <FileText className="h-3.5 w-3.5" />}
                  {t === 'text' ? (isAr ? 'نص' : 'Text') : t === 'image' ? (isAr ? 'صورة' : 'Image') : (isAr ? 'ملف' : 'File')}
                </button>
              ))}
            </div>
          </div>

          {/* Text message */}
          {msgType === 'text' && (
            <div className="space-y-2">
              <Label>{isAr ? 'نص الرسالة' : 'Message'}</Label>
              <Textarea
                rows={4}
                placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Type your message here...'}
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
          )}

          {/* Image/File upload */}
          {(msgType === 'image' || msgType === 'file') && (
            <div className="space-y-2">
              <Label>{msgType === 'image' ? (isAr ? 'الصورة' : 'Image') : (isAr ? 'الملف' : 'File')}</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-950/30 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="gap-1 max-w-xs truncate">
                      <Paperclip className="h-3 w-3" />
                      {file.name}
                    </Badge>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null) }}><X className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Paperclip className="h-6 w-6 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{isAr ? 'اضغط لاختيار الملف' : 'Click to choose file'}</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept={msgType === 'image' ? 'image/*' : '*/*'}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Textarea
                rows={2}
                placeholder={isAr ? 'تعليق اختياري...' : 'Optional caption...'}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" onClick={onClose}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 gap-2" disabled={sending}>
              {sending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send className="h-4 w-4" />}
              {isAr ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
